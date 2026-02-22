import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import { UserPlus } from 'lucide-react';
import LocationPicker from '../components/LocationPicker';
import toast from 'react-hot-toast';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'RECOLECTOR',
        nombre_entidad: '',
        coordenadas_base: '40.4168,-3.7038' // Default Madrid Center for testing
    });

    const [loading, setLoading] = useState(false);

    const setUser = useUserStore((state) => state.setUser);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.username.trim().length < 3) {
            toast.error('El usuario debe tener al menos 3 caracteres.');
            return;
        }

        if (formData.password.length < 6) {
            toast.error('La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        if (!formData.nombre_entidad.trim()) {
            toast.error('El nombre de la entidad es obligatorio.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://localhost:5443/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Recibir cookie HttpOnly
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en el registro');
            }

            setUser(data.user); // Token viaja como cookie HttpOnly
            toast.success('¡Registro exitoso! Bienvenido a FoodDrop');

            // Navigate to User Dashboard
            navigate('/dashboard');

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8 my-8">
                <header className="mb-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
                    <p className="text-gray-500 mt-2 text-sm">Únete a la red FoodDrop</p>
                </header>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Tipo de Usuario
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'RECOLECTOR' })}
                                className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${formData.role === 'RECOLECTOR' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                Recolector
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, role: 'DONANTE' })}
                                className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${formData.role === 'DONANTE' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'}`}
                            >
                                Donante
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="nombre_entidad">
                            Nombre Personal / Nombre Local
                        </label>
                        <input
                            id="nombre_entidad"
                            name="nombre_entidad"
                            type="text"
                            required
                            placeholder={formData.role === 'DONANTE' ? "Ej: Panadería Juan" : "Ej: María Perez"}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            value={formData.nombre_entidad}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="username">
                            Nombre de Usuario
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            placeholder="Ej: mariaperez20"
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">
                            Contraseña
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Selecciona tu Ubicación Base
                        </label>
                        <LocationPicker
                            defaultPosition={formData.coordenadas_base}
                            onChange={(coords) => setFormData(prev => ({ ...prev, coordenadas_base: coords }))}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:bg-emerald-400 mt-4"
                    >
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-gray-500">
                    ¿Ya tienes cuenta? <Link to="/login" className="text-emerald-600 font-medium hover:underline">Inicia Sesión</Link>
                </p>
            </div>
        </div>
    );
}
