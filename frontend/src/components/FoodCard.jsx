import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Utensils } from 'lucide-react';

// Caché simple en memoria para no saturar la API de Nominatim con las mismas coordenadas
const addressCache = {};

export default function FoodCard({ drop, userCoords, onClaim, isRecolector, onEdit, onDelete }) {
    // Calculadora de distancia usando la Fórmula de Haversine
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // Radio de la tierra en km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1); // 1 decimal (ej: 2.4 km)
    };

    let distance = 'N/A';
    if (drop.ubicacion && userCoords) {
        const [dropLat, dropLng] = drop.ubicacion.split(',').map(Number);
        const [userLat, userLng] = userCoords.split(',').map(Number);
        distance = calculateDistance(userLat, userLng, dropLat, dropLng);
    }

    const [address, setAddress] = useState('');

    useEffect(() => {
        if (!drop.ubicacion) return;

        const coords = drop.ubicacion; // Ej: "40.4168,-3.7038"

        if (addressCache[coords]) {
            setAddress(addressCache[coords]);
            return;
        }

        const fetchAddress = async () => {
            try {
                const [lat, lon] = coords.split(',');
                // Usar fetchLimit o setTimeout si hay muchas, pero Nominatim permite 1/req/seg.
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14`);
                const data = await response.json();

                if (data && data.address) {
                    // Extraer calle, barrio o ciudad
                    let locationName = data.address.road || data.address.neighbourhood || data.address.suburb || data.address.city || data.address.town || "Ubicación desconocida";

                    // Si tiene un número de calle
                    if (data.address.house_number && data.address.road) {
                        locationName += ` ${data.address.house_number}`;
                    }

                    addressCache[coords] = locationName;
                    setAddress(locationName);
                }
            } catch (error) {
                console.error("Error fetching address from Nominatim:", error);
            }
        };

        fetchAddress();
    }, [drop.ubicacion]);

    // Format para tiempo relativo (ej: "Hace 10 mins")
    const getRelativeTime = (dateString) => {
        const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
        const diffInMinutes = Math.round((new Date(dateString) - new Date()) / 60000);
        if (diffInMinutes > -60) return rtf.format(diffInMinutes, 'minute');
        const diffInHours = Math.round(diffInMinutes / 60);
        return rtf.format(diffInHours, 'hour');
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md flex flex-col group overflow-hidden">
            <div className="p-4 flex flex-col gap-3">
                {/* Header: título + foto al lateral */}
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{drop.titulo}</h3>
                        <p className="text-gray-500 text-sm mt-0.5">
                            Publicado por <span className="font-medium text-emerald-600">{drop.donante_nombre || "Usuario Anónimo"}</span>
                        </p>
                    </div>
                    {/* Foto pequeña al lateral */}
                    {drop.foto && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-gray-100 shadow-sm">
                            <img
                                src={drop.foto}
                                alt={drop.titulo}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>
                    )}
                </div>

                <p className="text-gray-600 text-sm line-clamp-2">
                    {drop.descripcion || "Sin descripción adicional proporcionada."}
                </p>

                {/* Grid de Estadísticas/Distancia */}
                <div className="flex flex-col gap-2 mt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2 overflow-hidden">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-medium truncate">
                            {address ? `${address} (${distance} km)` : `${distance} km (Calculando ruta...)`}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2 w-max">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="font-medium truncate">{getRelativeTime(drop.creado_en)}</span>
                    </div>
                </div>

                {/* Botón de recolección */}
                {isRecolector && drop.estado === 'DISPONIBLE' && (
                    <button
                        onClick={() => onClaim(drop.id)}
                        className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Utensils className="w-4 h-4" />
                        ¡Lo quiero!
                    </button>
                )}

                {/* Botones de acción para el Donante */}
                {!isRecolector && drop.estado === 'DISPONIBLE' && onEdit && onDelete && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onEdit(drop)}
                            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            Editar
                        </button>
                        <button
                            onClick={() => onDelete(drop.id)}
                            className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            Eliminar
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
