import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);

    const setUser = useUserStore((state) => state.setUser);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!credentials.username.trim()) {
            toast.error('Por favor ingresa un nombre de usuario válido.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('https://localhost:5443/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Necesario para recibir la cookie HttpOnly
                body: JSON.stringify(credentials)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            // Guardar datos del usuario (el token viaja como cookie HttpOnly)
            setUser(data.user);
            toast.success('¡Bienvenido de vuelta!');

            // Redirect based on role
            if (data.user.role === 'DONANTE') {
                navigate('/dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                <header className="mb-8 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <LogIn className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Bienvenido de vuelta</h1>
                    <p className="text-gray-500 mt-2 text-sm">Inicia sesión en tu cuenta FoodDrop</p>
                </header>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="username">
                            Usuario
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                            value={credentials.username}
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
                            value={credentials.password}
                            onChange={handleChange}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:bg-emerald-400 mt-2 shadow-sm"
                    >
                        {loading ? 'Iniciando sesión...' : 'Ingresar'}
                    </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-500">
                    ¿No tienes una cuenta aún?{' '}
                    <Link to="/register" className="text-emerald-600 font-medium hover:underline">
                        Crear Cuenta Nueva
                    </Link>
                </p>
            </div>
        </div>
    );
}
