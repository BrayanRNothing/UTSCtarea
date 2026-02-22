import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Arreglo para el icono por defecto de Leaflet en React (bug conocido)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componente para capturar los clics en el mapa
function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

// Componente para re-centrar el mapa si la posición inicial cambia o recibimos geolocalización
function RecenterAutomatically({ position }) {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, map.getZoom());
        }
    }, [position, map]);
    return null;
}

export default function LocationPicker({ onChange, defaultPosition }) {
    // Si pasamos una posición ("lat,lng"), la parseamos, sino, Madrid por defecto.
    const getInitialPosition = () => {
        if (defaultPosition) {
            const [lat, lng] = defaultPosition.split(',').map(Number);
            return { lat, lng };
        }
        return { lat: 40.4168, lng: -3.7038 };
    };

    const [position, setPosition] = useState(getInitialPosition());

    // Alerta arriba al componente padre cada que cambia
    useEffect(() => {
        if (position && onChange) {
            onChange(`${position.lat},${position.lng}`);
        }
    }, [position]);

    const handleLocateMe = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
            }, (error) => {
                alert("No pudimos obtener tu ubicación automáticamente.");
            });
        }
    };

    return (
        <div className="w-full h-[300px] sm:h-[400px] border border-gray-200 rounded-xl overflow-hidden relative z-0">
            <button
                type="button"
                onClick={handleLocateMe}
                className="absolute top-4 right-4 z-[400] bg-white text-gray-800 shadow-md font-semibold text-xs px-3 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
                📍 Usar mi ubicación actual
            </button>
            <MapContainer center={position} zoom={13} scrollWheelZoom={true} className="w-full h-full z-0">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
                <RecenterAutomatically position={position} />
            </MapContainer>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[400] bg-gray-900/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-sm pointer-events-none">
                Toca en el mapa para ajustar
            </div>
        </div>
    );
}
