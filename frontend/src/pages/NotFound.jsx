import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, AlertCircle, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <div className="relative z-10 max-w-lg bg-white p-10 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="flex justify-center mb-6 relative">
                    <div className="absolute inset-0 bg-red-100 rounded-full blur animate-pulse opacity-50"></div>
                    <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center relative z-10 border-4 border-white shadow-sm">
                        <UtensilsCrossed className="w-12 h-12 text-red-500" />
                    </div>
                    {/* Alerta flotante */}
                    <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md z-20">
                        <AlertCircle className="w-6 h-6 text-orange-500" />
                    </div>
                </div>

                <h1 className="text-5xl font-black text-gray-900 mb-2 tracking-tight">404</h1>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">El plato está vacío</h2>

                <p className="text-gray-500 mb-8 leading-relaxed">
                    Parece que te has perdido. La página o donación que estás buscando no existe, ha sido movida, o ya alguien se la devoró.
                </p>

                <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 w-full sm:w-auto"
                >
                    <Home className="w-5 h-5" />
                    Volver al Inicio Seguros
                </Link>
            </div>

            <p className="mt-12 text-gray-400 text-sm font-medium">FoodDrop &copy; {new Date().getFullYear()}</p>
        </div>
    );
}
