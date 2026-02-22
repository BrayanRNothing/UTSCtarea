import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import FoodCard from '../components/FoodCard';
import { Utensils, Send, CheckCircle2, LogOut, Plus, X, Globe2 } from 'lucide-react';

export default function Donante() {
    const { user, logout } = useUserStore();
    const navigate = useNavigate();

    const [drops, setDrops] = useState([]);
    const [loadingDrops, setLoadingDrops] = useState(true);

    // Form & modal state
    const [showModal, setShowModal] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [success, setSuccess] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [categoria, setCategoria] = useState('Panadería');

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

    useEffect(() => {
        fetchDrops();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoadingSubmit(true);

        try {
            const response = await fetch('https://localhost:5443/api/food-drops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    donante_id: user.id || 'mock-donante-123',
                    titulo,
                    descripcion,
                    categoria,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setSuccess(true);
                setTitulo('');
                setDescripcion('');
                fetchDrops(); // Recarga el feed instantáneamente
                setTimeout(() => {
                    setSuccess(false);
                    setShowModal(false);
                }, 1500);
            }
        } catch (error) {
            console.error('Error publicando el drop:', error);
            alert('Hubo un error al publicar la donación.');
        } finally {
            setLoadingSubmit(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col p-6 pt-8 relative">
            {/* Barra superior Donante */}
            <header className="w-full max-w-2xl mx-auto flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-500 font-medium">Comunidad FoodDrop</span>
                    <span className="font-bold text-gray-900 truncate max-w-[200px]">{user?.nombre_entidad || "Invitado"}</span>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex items-center gap-2"
                    title="Cerrar Sesión"
                >
                    <span className="text-sm font-medium hidden sm:block">Salir</span>
                    <LogOut className="w-5 h-5" />
                </button>
            </header>

            {/* Título del Feed */}
            <div className="w-full max-w-2xl mx-auto mb-6 flex items-center gap-2 text-gray-800">
                <Globe2 className="w-6 h-6 text-emerald-600" />
                <h2 className="text-xl font-bold">Publicaciones de la Red</h2>
            </div>

            {/* Feed Social de Donaciones */}
            <div className="w-full max-w-2xl mx-auto">
                {loadingDrops ? (
                    <div className="text-center py-10 text-gray-400">Cargando publicaciones...</div>
                ) : drops.length === 0 ? (
                    <div className="text-center p-12 mb-8 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-600 font-medium">Sé el primero en compartir comida hoy.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                        {drops.map(drop => (
                            <FoodCard
                                key={drop.id}
                                drop={drop}
                                userCoords={user?.coordenadas_base}
                                onClaim={() => alert("Los donantes no pueden comprar otros donantes en este sprint, logueate como Recolector :)")}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) */}
            <button
                onClick={() => setShowModal(true)}
                className="fixed bottom-8 right-8 bg-emerald-600 text-white p-4 rounded-full shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 hover:scale-105 transition-all z-40 flex items-center gap-2"
            >
                <Plus className="w-6 h-6" />
                <span className="font-bold hidden sm:block pr-2">Publicar</span>
            </button>

            {/* Modal de Nueva Publicación */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-xl flex items-center gap-2">
                                <Utensils className="text-emerald-600" /> Nuevo Donativo
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {success && (
                                <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 transition-all">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <p className="font-medium text-sm">¡Publicado exitosamente!</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="titulo">¿Qué vas a donar?</label>
                                    <input
                                        id="titulo" type="text" required
                                        placeholder="Ej: 10 barras de pan, 3 ensaladas..."
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                        value={titulo} onChange={(e) => setTitulo(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="categoria">Categoría</label>
                                    <select
                                        id="categoria"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                                        value={categoria} onChange={(e) => setCategoria(e.target.value)}
                                    >
                                        <option value="Panadería">🥖 Panadería</option>
                                        <option value="Fruta">🍎 Fruta y Verdura</option>
                                        <option value="Cocinados">🍲 Platos Cocinados</option>
                                        <option value="Otros">🍔 Otros</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="descripcion">Detalles (opcional)</label>
                                    <textarea
                                        id="descripcion" rows={2}
                                        placeholder="Ej: Recoger por puerta trasera"
                                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none"
                                        value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                                    />
                                </div>

                                <button
                                    type="submit" disabled={loadingSubmit}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:bg-emerald-400 flex items-center justify-center gap-2 shadow-sm mt-4"
                                >
                                    {loadingSubmit ? (<span className="animate-pulse">Publicando...</span>) : (<><Send className="w-4 h-4" /> Publicar en el Feed</>)}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
