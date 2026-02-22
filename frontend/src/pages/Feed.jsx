import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import useUserStore from '../store/useUserStore';
import { Loader2, LogOut, Search } from 'lucide-react';

export default function Feed() {
    const { user, logout } = useUserStore();
    const [drops, setDrops] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
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
                setLoading(false);
            }
        };
        fetchDrops();
    }, []);

    const handleClaim = (id) => {
        alert(`Reclamando el food drop con id: ${id}`);
        // Lógica para reclamar en el backend.
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 pt-8">
            <div className="max-w-3xl mx-auto">

                {/* Navbar interno */}
                <header className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">FoodDrops Disponibles</h1>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Hola, <span className="font-semibold text-emerald-600">{user.nombre_entidad}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </header>

                {/* Búsqueda MOCK rápida */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por comida o lugar..."
                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl pl-12 pr-4 py-3.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    />
                </div>

                {drops.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-600 font-medium">No hay comida disponible cerca en este momento.</p>
                        <p className="text-gray-400 text-sm mt-2">Prueba a refrescar la página en un rato.</p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        {drops.map(drop => (
                            <FoodCard
                                key={drop.id}
                                drop={drop}
                                userCoords={user.coordenadas_base}
                                onClaim={handleClaim}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
