import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb({ customPath }) {
    const location = useLocation();

    // Si pasamos un customPath, lo usamos:
    // Ejemplo: [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Ajustes', path: '#' }]
    let paths = customPath;

    if (!paths) {
        const pathnames = location.pathname.split('/').filter(x => x);
        paths = pathnames.map((value, index) => {
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;
            const isLast = index === pathnames.length - 1;
            return {
                label: value.charAt(0).toUpperCase() + value.slice(1),
                path: isLast ? '#' : to
            };
        });
    }

    return (
        <nav className="flex mb-4 text-gray-500 text-sm font-medium w-full" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                    <Link to="/" className="inline-flex items-center hover:text-emerald-600 transition-colors">
                        <Home className="w-4 h-4 mr-1.5" />
                        Inicio
                    </Link>
                </li>
                {paths.map((item, index) => (
                    <li key={index}>
                        <div className="flex items-center">
                            <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                            {item.path !== '#' ? (
                                <Link to={item.path} className="hover:text-emerald-600 transition-colors ml-1">
                                    {item.label}
                                </Link>
                            ) : (
                                <span className="text-gray-800 font-semibold ml-1">{item.label}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ol>
        </nav>
    );
}
