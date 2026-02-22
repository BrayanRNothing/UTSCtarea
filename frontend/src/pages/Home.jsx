import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import useUserStore from '../store/useUserStore';
import { Utensils, HeartHandshake, Leaf, ArrowRight } from 'lucide-react';

export default function Home() {
  const user = useUserStore(state => state.user);

  // Si ya está logueado, redirigimos dependiendo de su rol
  if (user) {
    if (user.role === 'DONANTE') return <Navigate to="/donante" replace />;
    if (user.role === 'RECOLECTOR') return <Navigate to="/feed" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navbar de Landing */}
      <nav className="w-full bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <Utensils className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">FoodDrop</span>
          </div>
          <div className="flex gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/register" className="px-5 py-2 text-sm font-medium bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all shadow-sm">
              Unirse Gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold mb-6 border border-orange-100">
          <Leaf className="w-3.5 h-3.5" />
          <span>Salvando comida, una porción a la vez</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
          Conecta excedentes con <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">quienes más lo necesitan</span>
        </h1>

        <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto">
          FoodDrop es la red en tiempo real que permite a restaurantes y panaderías donar su comida sobrante a ONGs y personas voluntarias en un solo click.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link to="/register" className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all shadow-lg active:scale-95">
            <HeartHandshake className="w-5 h-5" />
            Quiero Donar o Recoger
          </Link>
          <Link to="/login" className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 px-8 py-4 rounded-2xl font-semibold text-lg transition-all active:scale-95">
            Acceder a mi cuenta
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </Link>
        </div>
      </main>

      {/* Grid de Funcionalidades */}
      <section className="bg-white py-20 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Publica en 1 Click</h3>
            <p className="text-gray-500 text-sm leading-relaxed">¿Te sobró pan? Sube tu excedente a la plataforma instantáneamente sin inventarios complejos.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Red Inteligente</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Conecta automáticamente con los recolectores que están a menos km de tu ubicación actual.</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Cero Desperdicio</h3>
            <p className="text-gray-500 text-sm leading-relaxed">Colabora con el medio ambiente evitando que miles de kilos de comida terminen en la basura.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
