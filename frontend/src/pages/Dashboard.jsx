import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import FoodCard from '../components/FoodCard';
import LocationPicker from '../components/LocationPicker';
import Breadcrumb from '../components/Breadcrumb';
import { Utensils, Send, CheckCircle2, LogOut, Plus, X, User, Settings, Search, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
    const { user, logout, updateUser } = useUserStore();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('feed');

    const [drops, setDrops] = useState([]);
    const [claimedDrops, setClaimedDrops] = useState([]);
    const [donatedDrops, setDonatedDrops] = useState([]);
    const [loadingDrops, setLoadingDrops] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todas');
    const filterOptions = ['Todas', 'Vegana', 'Carne', 'Panadería', 'Frutas', 'Local'];

    const [settingsData, setSettingsData] = useState({
        nombre_entidad: user?.nombre_entidad || '',
        username: user?.username || '',
        coordenadas_base: user?.coordenadas_base || '40.4168,-3.7038'
    });
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsSuccess, setSettingsSuccess] = useState(false);

    // Modal para publicar (Solo Donantes)
    const [showModal, setShowModal] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [ubicacion, setUbicacion] = useState(user?.coordenadas_base || '40.4168,-3.7038');
    const [foto, setFoto] = useState(''); // String base64
    const [categoria, setCategoria] = useState('Local'); // Default category para filtros

    // Estados para Edit/Delete de posts
    const [isEditing, setIsEditing] = useState(false);
    const [editingDropId, setEditingDropId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [dropToDelete, setDropToDelete] = useState(null);

    // Modal para confirmar reserva
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [selectedClaimId, setSelectedClaimId] = useState(null);
    const [loadingClaim, setLoadingClaim] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fetchDrops = async () => {
        try {
            const response = await fetch('https://localhost:5443/api/food-drops/available');
            const data = await response.json();
            if (data.success) {
                setDrops(data.drops);
            }
        } catch (error) {
            console.error('Error fetching drops:', error);
        } finally {
            setLoadingDrops(false);
        }
    };

    const fetchClaimedDrops = async () => {
        if (user?.role !== 'RECOLECTOR') return;
        try {
            const response = await fetch(`https://localhost:5443/api/food-drops/claimed/${user.id}`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setClaimedDrops(data.drops);
            }
        } catch (error) {
            console.error('Error fetching claimed drops:', error);
        }
    };

    const fetchDonatedDrops = async () => {
        if (user?.role !== 'DONANTE') return;
        try {
            const response = await fetch(`https://localhost:5443/api/food-drops/donated/${user.id}`, {
                credentials: 'include',
            });
            const data = await response.json();
            if (data.success) {
                setDonatedDrops(data.drops);
            }
        } catch (error) {
            console.error('Error fetching donated drops:', error);
        }
    };

    useEffect(() => {
        fetchDrops();
        fetchClaimedDrops();
        fetchDonatedDrops();
    }, [user?.id]);

    const filteredDrops = drops.filter(drop => {
        const matchesSearch = drop.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (drop.descripcion && drop.descripcion.toLowerCase().includes(searchTerm.toLowerCase()));

        let matchesFilter = true;
        if (activeFilter !== 'Todas') {
            matchesFilter = drop.titulo.toLowerCase().includes(activeFilter.toLowerCase()) ||
                (drop.descripcion && drop.descripcion.toLowerCase().includes(activeFilter.toLowerCase()));
        }
        return matchesSearch && matchesFilter;
    });

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSavingSettings(true);
        try {
            const res = await fetch('https://localhost:5443/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ id: user.id, ...settingsData })
            });
            const data = await res.json();
            if (data.success) {
                updateUser(data.user);
                setSettingsSuccess(true);
                toast.success('Perfil actualizado correctamente');
                setTimeout(() => setSettingsSuccess(false), 2000);
            } else {
                toast.error(data.error || 'Error al actualizar perfil');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al conectar con el servidor.');
        } finally {
            setSavingSettings(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!titulo.trim()) {
            toast.error('Por favor ingresa un título para la donación.');
            return;
        }

        setLoadingSubmit(true);

        const url = isEditing
            ? `https://localhost:5443/api/food-drops/${editingDropId}`
            : 'https://localhost:5443/api/food-drops';

        const method = isEditing ? 'PUT' : 'POST';

        try {
            // Prepend categoria if it's not 'Todas' and not already there
            let finalDesc = descripcion;
            if (categoria !== 'Todas' && !descripcion.startsWith(`[${categoria}]`)) {
                finalDesc = `[${categoria}] ${descripcion}`;
            }

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    donante_id: user?.id,
                    titulo,
                    descripcion: finalDesc,
                    ubicacion,
                    foto
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success(isEditing ? '¡Donación editada con éxito!' : '¡Donación publicada con éxito!');

                fetchDrops();
                if (user?.role === 'DONANTE') fetchDonatedDrops();

                setTimeout(() => {
                    handleCloseModal();
                }, 1500);
            } else {
                toast.error(data.error || 'Error al guardar la donación.');
            }
        } catch (error) {
            console.error('Error guardando:', error);
            toast.error('Error de red al guardar.');
        } finally {
            setLoadingSubmit(false);
        }
    };

    const handleEditDrop = (drop) => {
        setIsEditing(true);
        setEditingDropId(drop.id);
        setTitulo(drop.titulo);

        // Extract category if it exists in description
        let desc = drop.descripcion || '';
        let cat = 'Todas';
        const match = desc.match(/^\[(.*?)\] (.*)/);
        if (match) {
            cat = match[1];
            desc = match[2];
        }

        setCategoria(cat);
        setDescripcion(desc);
        setUbicacion(drop.ubicacion || user?.coordenadas_base);
        setFoto(drop.foto || '');
        setShowModal(true);
    };

    const confirmDeleteDrop = (id) => {
        setShowDeleteModal(true);
        setDropToDelete(id);
    };

    const handleDeleteDrop = async () => {
        if (!dropToDelete) return;

        try {
            const res = await fetch(`https://localhost:5443/api/food-drops/${dropToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Donación eliminada exitosamente');
                fetchDrops();
                fetchDonatedDrops();
            } else {
                toast.error(data.error || 'No se pudo eliminar la donación');
            }
        } catch (error) {
            toast.error('Error de red al intentar eliminar.');
        } finally {
            setShowDeleteModal(false);
            setDropToDelete(null);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setIsEditing(false);
        setEditingDropId(null);
        setTitulo('');
        setDescripcion('');
        setCategoria('Local');
        setFoto('');
        setUbicacion(user?.coordenadas_base || '40.4168,-3.7038');
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFoto(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClaimClick = (id) => {
        if (user?.role !== 'RECOLECTOR') {
            toast.error("Solo los recolectores pueden solicitar donaciones.");
            return;
        }
        setSelectedClaimId(id);
        setShowClaimModal(true);
    };

    const confirmClaim = async () => {
        if (!selectedClaimId) return;
        setLoadingClaim(true);

        try {
            const res = await fetch(`https://localhost:5443/api/food-drops/${selectedClaimId}/claim`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ recolector_id: user.id })
            });
            const data = await res.json();

            if (data.success) {
                // Refresh data
                fetchDrops();
                fetchClaimedDrops();
                setShowClaimModal(false);
                setSelectedClaimId(null);
                toast.success('¡Donación reservada con éxito!');
            } else {
                toast.error(data.error || 'Error al reclamar la donación.');
            }
        } catch (error) {
            console.error('Error in claim:', error);
            toast.error('Error de conexión.');
        } finally {
            setLoadingClaim(false);
        }
    };

    return (
        <div className="flex bg-gray-50 h-screen overflow-hidden font-sans">

            {/* ========================================================= */}
            {/* SIDEBAR (Izquierda) */}
            {/* ========================================================= */}
            <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-gray-100 p-6 shadow-sm z-10 shrink-0 relative">

                <div className="flex items-center gap-2 mb-12">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                        <Utensils className="w-5 h-5 text-emerald-600" />
                    </div>
                    <span className="font-bold text-xl text-gray-900 tracking-tight">FoodDrop</span>
                </div>

                {/* Tarjeta de Perfil */}
                <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-100 mb-8 flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                        <User className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-emerald-600 mb-0.5 uppercase tracking-wider">{user?.role}</p>
                        <h2 className="text-xl font-bold text-gray-900 truncate">{user?.nombre_entidad || "Usuario Invitado"}</h2>
                        <p className="text-gray-500 text-sm truncate mt-1">@{user?.username || "invitado"}</p>
                    </div>
                </div>

                {/* Info Extra según el Rol */}
                <div className="flex-1 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('feed')}
                        className={`w-full flex items-center justify-start gap-3 p-4 rounded-xl font-medium transition-all ${activeTab === 'feed' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Utensils className="w-5 h-5" />
                        Feed de Donaciones
                    </button>
                    {user?.role === 'RECOLECTOR' && (
                        <button
                            onClick={() => setActiveTab('reservas')}
                            className={`w-full flex items-center justify-start gap-3 p-4 rounded-xl font-medium transition-all ${activeTab === 'reservas' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Mis Reservas
                        </button>
                    )}
                    {user?.role === 'DONANTE' && (
                        <button
                            onClick={() => setActiveTab('donaciones')}
                            className={`w-full flex items-center justify-start gap-3 p-4 rounded-xl font-medium transition-all ${activeTab === 'donaciones' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <CheckCircle2 className="w-5 h-5" />
                            Mis Donaciones
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`w-full flex items-center justify-start gap-3 p-4 rounded-xl font-medium transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Settings className="w-5 h-5" />
                        Ajustes de Perfil
                    </button>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        {user?.role === 'DONANTE' ? (
                            <div className="bg-white border text-center border-gray-100 p-6 rounded-3xl shadow-sm mb-6">
                                <h3 className="font-bold text-gray-800 mb-2">Comunidad</h3>
                                <p className="text-gray-500 text-sm">Tu donativo puede ser la comida de hoy para alguien más.</p>
                            </div>
                        ) : (
                            <div className="bg-white border text-center border-gray-100 p-6 rounded-3xl shadow-sm mb-6">
                                <h3 className="font-bold text-gray-800 mb-2">Tus Reservas</h3>
                                <p className="text-gray-500 text-sm">Pronto verás aquí la lista de las donaciones que has reservado para hoy.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Botón Salir */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-500 p-4 rounded-full transition-colors font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    Cerrar Sesión
                </button>
            </aside>

            {/* ========================================================= */}
            {/* MAIN CONTENT WALL (Derecha) */}
            {/* ========================================================= */}
            <main className="flex-1 flex flex-col h-full bg-gray-50 relative overflow-y-auto w-full scroll-smooth pb-20 lg:pb-0">

                {/* Header móvil */}
                <header className="lg:hidden w-full bg-white border-b border-gray-100 p-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-100 p-1.5 rounded-lg">
                            <Utensils className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-bold text-gray-900 tracking-tight">FoodDrop</span>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 rounded-lg">
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                <div className="w-full max-w-7xl mx-auto p-4 lg:p-8">
                    {activeTab === 'feed' ? (
                        <>
                            <div className="flex flex-col gap-4 mb-8 lg:mt-4">
                                <Breadcrumb customPath={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Feed de Donaciones', path: '#' }]} />
                                <h1 className="text-2xl font-extrabold text-gray-900">
                                    Red de Donaciones
                                </h1>
                                {/* Buscador */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar donaciones (ej. manzanas, pan, vegana...)"
                                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                {/* Filtros Rápidos */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {filterOptions.map(option => (
                                        <button
                                            key={option}
                                            onClick={() => setActiveFilter(option)}
                                            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-all border ${activeFilter === option ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Feed */}
                            {loadingDrops ? (
                                <div className="text-center py-20 text-gray-400">Cargando publicaciones...</div>
                            ) : filteredDrops.length === 0 ? (
                                <div className="text-center p-12 mb-8 bg-white rounded-3xl shadow-sm border border-gray-100">
                                    <p className="text-gray-600 font-medium">No se encontraron donaciones con esos filtros.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {filteredDrops.map(drop => (
                                        <FoodCard
                                            key={drop.id}
                                            drop={drop}
                                            userCoords={user?.coordenadas_base}
                                            onClaim={handleClaimClick}
                                            isRecolector={user?.role === 'RECOLECTOR'}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    ) : activeTab === 'reservas' ? (
                        <div className="flex flex-col gap-4 mb-8 lg:mt-4">
                            <Breadcrumb customPath={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Mis Reservas', path: '#' }]} />
                            <h1 className="text-2xl font-extrabold text-gray-900">Mis Reservas</h1>

                            {/* Buscador en Reservas */}
                            {claimedDrops.length > 0 && (
                                <div className="relative mb-2">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Buscar en mis reservas..."
                                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl pl-11 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            )}

                            {claimedDrops.length === 0 ? (
                                <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
                                    <p className="text-gray-600 font-medium">Aún no has reclamado ninguna donación.</p>
                                    <button onClick={() => setActiveTab('feed')} className="mt-4 text-emerald-600 font-semibold hover:underline">Ir al Feed</button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {claimedDrops
                                        .filter(drop =>
                                            drop.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (drop.descripcion && drop.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
                                        )
                                        .map(drop => (
                                            <div key={drop.id} className="relative">
                                                <div className="absolute -top-3 -right-3 bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 border border-emerald-200">
                                                    Reservado
                                                </div>
                                                <FoodCard
                                                    drop={drop}
                                                    userCoords={user?.coordenadas_base}
                                                    onClaim={() => { }}
                                                    isRecolector={false} // Disable claim button in this view
                                                />
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'donaciones' ? (
                        <div className="flex flex-col gap-4 mb-8 lg:mt-4">
                            <Breadcrumb customPath={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Mis Donaciones', path: '#' }]} />
                            <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Mis Donaciones</h1>
                            {donatedDrops.length === 0 ? (
                                <div className="text-center p-12 bg-white rounded-3xl shadow-sm border border-gray-100">
                                    <p className="text-gray-600 font-medium">Aún no has publicado ninguna donación.</p>
                                    <button onClick={() => {
                                        handleCloseModal();
                                        setShowModal(true);
                                    }} className="mt-4 text-emerald-600 font-semibold hover:underline">Hacer una Donación</button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {donatedDrops.map(drop => (
                                        <div key={drop.id} className="relative">
                                            {drop.estado === 'RESERVADO' ? (
                                                <div className="absolute -top-3 -right-3 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 border border-amber-200">
                                                    Reservado por {drop.recolector_nombre || 'Alguien'}
                                                </div>
                                            ) : drop.estado === 'ENTREGADO' ? (
                                                <div className="absolute -top-3 -right-3 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 border border-blue-200">
                                                    Entregado
                                                </div>
                                            ) : (
                                                <div className="absolute -top-3 -right-3 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 border border-gray-200">
                                                    Disponible
                                                </div>
                                            )}
                                            <FoodCard
                                                drop={drop}
                                                userCoords={user?.coordenadas_base}
                                                onClaim={() => { }}
                                                isRecolector={false}
                                                onEdit={handleEditDrop}
                                                onDelete={confirmDeleteDrop}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8 lg:mt-4">
                            <Breadcrumb customPath={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Ajustes de Perfil', path: '#' }]} />
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-emerald-600" /> Ajustes de Perfil
                            </h2>

                            {settingsSuccess && (
                                <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <p className="font-medium text-sm">Perfil modificado con éxito.</p>
                                </div>
                            )}

                            <form onSubmit={handleSaveSettings} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="set_entidad">Nombre o Nombre de Entidad</label>
                                    <input
                                        id="set_entidad" type="text" required
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={settingsData.nombre_entidad}
                                        onChange={(e) => setSettingsData({ ...settingsData, nombre_entidad: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="set_username">Nombre de Usuario</label>
                                    <input
                                        id="set_username" type="text" required
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                                        value={settingsData.username}
                                        onChange={(e) => setSettingsData({ ...settingsData, username: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ubicación Base (Punto de entrega habitual / Búsqueda habitual)</label>
                                    <div className="mt-2 border border-gray-100 rounded-xl overflow-hidden relative z-0">
                                        <LocationPicker
                                            defaultPosition={settingsData.coordenadas_base}
                                            onChange={(coords) => setSettingsData({ ...settingsData, coordenadas_base: coords })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <button
                                        type="submit" disabled={savingSettings}
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-all active:scale-[0.98] disabled:bg-emerald-400 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        {savingSettings ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Floating Action Button para DONANTES */}
                {user?.role === 'DONANTE' && (
                    <button
                        onClick={() => { handleCloseModal(); setShowModal(true); }}
                        className="fixed bottom-6 right-6 lg:bottom-12 lg:right-12 bg-emerald-600 text-white w-14 h-14 rounded-full shadow-2xl hover:bg-emerald-700 hover:scale-105 transition-all z-30 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                )}
            </main>

            {/* ========================================================= */}
            {/* MODAL NUEVA PUBLICACIÓN / EDICIÓN */}
            {/* ========================================================= */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Utensils className="text-emerald-600 w-5 h-5" />
                                {isEditing ? 'Editar Donación' : 'Regalar Comida'}
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 max-h-[80vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="titulo">¿Qué vas a regalar?</label>
                                    <input
                                        id="titulo" type="text" required
                                        placeholder="Ej: 10 barras de pan..."
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        value={titulo} onChange={(e) => setTitulo(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Ubicación de Recogida</label>
                                        <div className="mt-2">
                                            <LocationPicker
                                                defaultPosition={ubicacion}
                                                onChange={(coords) => setUbicacion(coords)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="foto">Foto de la comida</label>
                                        <input
                                            id="foto" type="file" accept="image/*"
                                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                            onChange={handlePhotoUpload}
                                        />
                                        {/* Preview image */}
                                        {foto && (
                                            <div className="mt-3 relative inline-block">
                                                <img src={foto} alt="Preview" className="h-24 w-32 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                                <button type="button" onClick={() => setFoto('')} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="categoria">Categoría</label>
                                    <select
                                        id="categoria"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={categoria} onChange={(e) => setCategoria(e.target.value)}
                                    >
                                        {filterOptions.filter(o => o !== 'Todas').map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                        <option value="Todas">Otra / Sin Especificar</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="descripcion">Instrucciones de recogida</label>
                                    <textarea
                                        id="descripcion" rows={2}
                                        placeholder="Ej: Tocar el timbre rojo, preguntar por Ana..."
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                        value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit" disabled={loadingSubmit}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl transition-all active:scale-[0.98] disabled:bg-emerald-400 flex items-center justify-center gap-2 shadow-sm mt-6"
                                >
                                    {loadingSubmit ? (<span className="animate-pulse">Publicando...</span>) : (<><Send className="w-5 h-5" /> Lanzar Donativo</>)}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para Confirmar Eliminación */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                            <Utensils className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
                        <p className="text-gray-500 mb-8">
                            Una vez eliminada la donación, desaparecerá del feed de la comunidad y no podrás recuperarla.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDropToDelete(null);
                                }}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteDrop}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm"
                            >
                                Sí, eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL CONFIRMAR RESERVA */}
            {/* ========================================================= */}
            {showClaimModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 p-6 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 mb-6">
                            <Utensils className="h-8 w-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Deseas separar esta donación?</h3>
                        <p className="text-gray-500 mb-8">
                            Al separarla te comprometes a ir a buscarla lo antes posible a la ubicación indicada.
                        </p>

                        <div className="flex gap-3 w-full">
                            <button
                                onClick={() => {
                                    setShowClaimModal(false);
                                    setSelectedClaimId(null);
                                }}
                                disabled={loadingClaim}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmClaim}
                                disabled={loadingClaim}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center"
                            >
                                {loadingClaim ? 'Procesando...' : 'Sí, lo quiero'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ========================================================= */}
            {/* BOTTOM NAVIGATION (Mobile) */}
            {/* ========================================================= */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center p-2 z-[90] lg:hidden pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-colors ${activeTab === 'feed' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Utensils className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Feed</span>
                </button>

                {user?.role === 'RECOLECTOR' && (
                    <button
                        onClick={() => setActiveTab('reservas')}
                        className={`flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-colors ${activeTab === 'reservas' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Reservas</span>
                    </button>
                )}

                {user?.role === 'DONANTE' && (
                    <button
                        onClick={() => setActiveTab('donaciones')}
                        className={`flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-colors ${activeTab === 'donaciones' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <CheckCircle2 className="w-6 h-6" />
                        <span className="text-[10px] font-medium">Historial</span>
                    </button>
                )}

                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex flex-col items-center gap-1 min-w-[64px] p-2 rounded-xl transition-colors ${activeTab === 'settings' ? 'text-emerald-600 bg-emerald-50' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] font-medium">Ajustes</span>
                </button>
            </nav>
        </div>
    );
}
