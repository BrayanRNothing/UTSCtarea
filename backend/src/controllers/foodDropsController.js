const db = require('../db');
const { v4: uuidv4 } = require('uuid');

exports.createFoodDrop = (req, res) => {
    const { donante_id, titulo, descripcion, ubicacion, foto } = req.body;

    if (!donante_id || !titulo || !ubicacion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para el Drop.' });
    }

    try {
        const id = uuidv4();
        const stmt = db.prepare('INSERT INTO FoodDrops (id, donante_id, titulo, descripcion, ubicacion, foto, estado) VALUES (?, ?, ?, ?, ?, ?, ?)');
        stmt.run(id, donante_id, titulo, descripcion || '', ubicacion, foto || null, 'DISPONIBLE');

        // Devolvemos el registro insertado con el nombre del donante
        const stmtSelect = db.prepare(`
            SELECT f.*, u.nombre_entidad as donante_nombre, u.coordenadas_base as donante_coordenadas 
            FROM FoodDrops f
            JOIN Users u ON f.donante_id = u.id
            WHERE f.id = ?
        `);
        const newDrop = stmtSelect.get(id);

        res.status(201).json({ success: true, drop: newDrop });
    } catch (error) {
        console.error('Error insertando FoodDrop:', error);
        res.status(500).json({ error: 'Error del servidor al crear Drop' });
    }
};

exports.getAvailableDrops = (req, res) => {
    try {
        // Obtenemos los drops disponibles junto con parte de la información del donante
        const stmt = db.prepare(`
      SELECT f.*, u.nombre_entidad as donante_nombre, u.coordenadas_base as donante_coordenadas 
      FROM FoodDrops f
      JOIN Users u ON f.donante_id = u.id
      WHERE f.estado = 'DISPONIBLE'
      ORDER BY f.creado_en DESC
    `);
        const drops = stmt.all();

        res.json({ success: true, drops });
    } catch (error) {
        console.error('Error obteniendo FoodDrops:', error);
        res.status(500).json({ error: 'Error del servidor al obtener Drops' });
    }
};

exports.claimFoodDrop = (req, res) => {
    const { id } = req.params;
    const { recolector_id } = req.body;

    if (!recolector_id) {
        return res.status(400).json({ error: 'Se requiere el ID del recolector.' });
    }

    try {
        const drop = db.prepare('SELECT estado FROM FoodDrops WHERE id = ?').get(id);
        if (!drop) {
            return res.status(404).json({ error: 'FoodDrop no encontrado.' });
        }
        if (drop.estado !== 'DISPONIBLE') {
            return res.status(400).json({ error: 'Esta donación ya no está disponible.' });
        }

        const claimId = uuidv4();
        // Insert into Claims table and update FoodDrop state in a transaction
        const claimTx = db.transaction(() => {
            db.prepare('INSERT INTO Claims (id, drop_id, recolector_id, hora_recogida_estimada) VALUES (?, ?, ?, ?)').run(
                claimId, id, recolector_id, new Date().toISOString()
            );
            db.prepare("UPDATE FoodDrops SET estado = 'RESERVADO' WHERE id = ?").run(id);
        });

        claimTx();

        res.json({ success: true, message: 'Donación reservada exitosamente.' });
    } catch (error) {
        console.error('Error reclamando FoodDrop:', error);
        res.status(500).json({ error: 'Error del servidor.' });
    }
};

exports.getClaimedDrops = (req, res) => {
    const { userId } = req.params;
    try {
        const stmt = db.prepare(`
            SELECT f.*, u.nombre_entidad as donante_nombre, u.coordenadas_base as donante_coordenadas 
            FROM FoodDrops f
            JOIN Claims c ON f.id = c.drop_id
            JOIN Users u ON f.donante_id = u.id
            WHERE c.recolector_id = ?
            ORDER BY c.hora_recogida_estimada DESC
        `);
        const drops = stmt.all(userId);
        res.json({ success: true, drops });
    } catch (error) {
        console.error('Error obteniendo FoodDrops reclamados:', error);
        res.status(500).json({ error: 'Error del servidor.' });
    }
};

exports.getDonatedDrops = (req, res) => {
    const { donanteId } = req.params;
    try {
        const stmt = db.prepare(`
            SELECT f.*, 
                   u_donante.nombre_entidad as donante_nombre, 
                   u_donante.coordenadas_base as donante_coordenadas,
                   c.hora_recogida_estimada,
                   u_recolector.nombre_entidad as recolector_nombre,
                   u_recolector.username as recolector_username
            FROM FoodDrops f
            JOIN Users u_donante ON f.donante_id = u_donante.id
            LEFT JOIN Claims c ON f.id = c.drop_id
            LEFT JOIN Users u_recolector ON c.recolector_id = u_recolector.id
            WHERE f.donante_id = ?
            ORDER BY f.creado_en DESC
        `);
        const drops = stmt.all(donanteId);
        res.json({ success: true, drops });
    } catch (error) {
        console.error('Error obteniendo FoodDrops donados:', error);
        res.status(500).json({ error: 'Error del servidor.' });
    }
};

exports.updateFoodDrop = (req, res) => {
    const { id } = req.params;
    const { titulo, descripcion, ubicacion, foto } = req.body;
    // Tomamos el donante_id directamente del token JWT para evitar suplantación
    const donante_id = req.user.id;

    try {
        // Verificar que el drop existe, pertenece al donante y está DISPONIBLE
        const checkDrop = db.prepare('SELECT donante_id, estado FROM FoodDrops WHERE id = ?').get(id);

        if (!checkDrop) return res.status(404).json({ error: 'Donación no encontrada' });
        if (checkDrop.donante_id !== donante_id) return res.status(403).json({ error: 'No tienes permiso para editar esta donación' });
        if (checkDrop.estado !== 'DISPONIBLE') return res.status(400).json({ error: 'Solo se pueden editar donaciones disponibles' });

        const stmt = db.prepare(`
            UPDATE FoodDrops 
            SET titulo = ?, descripcion = ?, ubicacion = ?, foto = ?
            WHERE id = ?
        `);

        const result = stmt.run(titulo, descripcion, ubicacion, foto, id);

        if (result.changes > 0) {
            res.json({ success: true, message: 'Donación actualizada correctamente' });
        } else {
            res.status(400).json({ error: 'No se pudo actualizar la donación' });
        }
    } catch (error) {
        console.error('Error en updateFoodDrop:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};

exports.deleteFoodDrop = (req, res) => {
    const { id } = req.params;
    // Tomamos el donante_id directamente del token JWT para evitar suplantación
    const donante_id = req.user.id;

    try {
        // Verificar existencia y permisos
        const checkDrop = db.prepare('SELECT donante_id, estado FROM FoodDrops WHERE id = ?').get(id);

        if (!checkDrop) return res.status(404).json({ error: 'Donación no encontrada' });
        if (checkDrop.donante_id !== donante_id) return res.status(403).json({ error: 'No tienes permiso para eliminar esta donación' });
        if (checkDrop.estado !== 'DISPONIBLE') return res.status(400).json({ error: 'No puedes eliminar una donación que ya está reservada o entregada' });

        const stmt = db.prepare('DELETE FROM FoodDrops WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes > 0) {
            res.json({ success: true, message: 'Donación eliminada correctamente' });
        } else {
            res.status(400).json({ error: 'No se pudo eliminar la donación' });
        }
    } catch (error) {
        console.error('Error en deleteFoodDrop:', error);
        res.status(500).json({ error: 'Error del servidor' });
    }
};
