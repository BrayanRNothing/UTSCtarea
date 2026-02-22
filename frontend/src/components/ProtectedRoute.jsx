import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useUserStore from '../store/useUserStore';

export default function ProtectedRoute({ children, allowedRoles }) {
    const user = useUserStore((state) => state.user);
    const location = useLocation();

    if (!user) {
        // Si no está logueado, a login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Si está logueado pero su rol no cuadra, mándalo a su home por defecto
        if (user.role === 'DONANTE') return <Navigate to="/donante" replace />;
        if (user.role === 'RECOLECTOR') return <Navigate to="/feed" replace />;

        // Fallback
        return <Navigate to="/" replace />;
    }

    return children;
}
