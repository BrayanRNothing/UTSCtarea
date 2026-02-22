const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../config/auth');
const SALT_ROUNDS = 10;

// Helper: enviar el JWT como cookie HttpOnly segura
const setAuthCookie = (res, token) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('auth_token', token, {
        httpOnly: true,          // No accesible desde JS en el navegador
        secure: isProduction,    // Solo HTTPS en producción (en dev va por HTTP también)
        sameSite: 'lax',         // Proteción CSRF básica
        maxAge: 24 * 60 * 60 * 1000, // 24 horas en ms
    });
};

exports.register = async (req, res) => {
    const { username, password, role, nombre_entidad, coordenadas_base } = req.body;

    if (!username || !password || !role || !nombre_entidad || !coordenadas_base) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        const existingUser = db.prepare('SELECT id FROM Users WHERE username = ?').get(username);
        if (existingUser) {
            return res.status(409).json({ error: 'El nombre de usuario ya está registrado.' });
        }

        const id = uuidv4();
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const stmt = db.prepare('INSERT INTO Users (id, username, password_hash, role, nombre_entidad, coordenadas_base) VALUES (?, ?, ?, ?, ?, ?)');
        stmt.run(id, username, passwordHash, role, nombre_entidad, coordenadas_base);

        const newUser = db.prepare('SELECT id, username, role, nombre_entidad, coordenadas_base FROM Users WHERE id = ?').get(id);

        // Generar JWT y enviarlo como cookie HttpOnly
        const token = jwt.sign(
            { id: newUser.id, username: newUser.username, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        setAuthCookie(res, token);
        // También se devuelve en el body por compatibilidad / para que el store guarde el usuario
        res.status(201).json({ success: true, user: newUser, token });
    } catch (error) {
        console.error('Error registrando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    try {
        const user = db.prepare('SELECT id, username, role, nombre_entidad, coordenadas_base, password_hash FROM Users WHERE username = ?').get(username);

        const passwordMatch = user && await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        delete user.password_hash;

        // Generar JWT y enviarlo como cookie HttpOnly
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        setAuthCookie(res, token);
        res.json({ success: true, user, token });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};

exports.updateProfile = (req, res) => {
    const { id, nombre_entidad, username, coordenadas_base } = req.body;

    if (!id || !nombre_entidad || !username || !coordenadas_base) {
        return res.status(400).json({ error: 'Faltan datos para actualizar el perfil.' });
    }

    try {
        // Verificar que el nuevo username no exista en otro usuario
        const existingUser = db.prepare('SELECT id FROM Users WHERE username = ? AND id != ?').get(username, id);
        if (existingUser) {
            return res.status(409).json({ error: 'El nombre de usuario ya está ocupado por otra cuenta.' });
        }

        const stmt = db.prepare('UPDATE Users SET nombre_entidad = ?, username = ?, coordenadas_base = ? WHERE id = ?');
        stmt.run(nombre_entidad, username, coordenadas_base, id);

        const updatedUser = db.prepare('SELECT id, username, role, nombre_entidad, coordenadas_base FROM Users WHERE id = ?').get(id);

        if (!updatedUser) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        res.status(500).json({ error: 'Error del servidor al actualizar perfil.' });
    }
};

// Cerrar sesión: limpiar cookie HttpOnly
exports.logout = (req, res) => {
    res.clearCookie('auth_token', { httpOnly: true, sameSite: 'lax' });
    res.json({ success: true, message: 'Sesión cerrada correctamente.' });
};
