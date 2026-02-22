const fs = require('fs');
const path = require('path');
const db = require('./db');
const bcrypt = require('bcrypt');

const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema);

// Insertar usuario mock para pruebas si no existe
const existingUser = db.prepare('SELECT id FROM Users WHERE username = ?').get('donante_mock');
if (!existingUser) {
    const passwordHash = bcrypt.hashSync('12345', 10);
    const insertUser = db.prepare('INSERT INTO Users (id, username, password_hash, role, nombre_entidad, coordenadas_base) VALUES (?, ?, ?, ?, ?, ?)');
    insertUser.run('mock-donante-123', 'donante_mock', passwordHash, 'DONANTE', 'Panadería La Central', '40.4168,-3.7038');
    console.log('Mock user created.');
}

const loadMockData = () => {
    try {
        const drops = db.prepare('SELECT COUNT(*) as count FROM FoodDrops').get();
        if (drops.count === 0) {
            console.log('Inserting mock food drops...');
            const insertDrop = db.prepare(`
        INSERT INTO FoodDrops (id, donante_id, titulo, descripcion, ubicacion, foto, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

            const mockDrops = [
                {
                    id: 'drop-1',
                    donante_id: 'mock-donante-123',
                    titulo: 'Pan artesanal sobras',
                    descripcion: 'Nos sobraron 5 barras de pan baguette del turno de la mañana. Perfectas condiciones.',
                    ubicacion: '40.4168,-3.7038',
                    foto: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
                    estado: 'DISPONIBLE'
                },
                {
                    id: 'drop-2',
                    donante_id: 'mock-donante-123',
                    titulo: 'Cajas de manzanas y peras',
                    descripcion: 'Fruta un poco madura pero ideal para mermelada o consumo rápido.',
                    ubicacion: '40.4200,-3.7000',
                    foto: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80',
                    estado: 'DISPONIBLE'
                }
            ];

            mockDrops.forEach(drop => {
                insertDrop.run(drop.id, drop.donante_id, drop.titulo, drop.descripcion, drop.ubicacion, drop.foto, drop.estado);
            });
            console.log('Mock food drops inserted.');
        }
    } catch (error) {
        console.error('Error loading mock data:', error);
    }
};

loadMockData();

console.log('Database initialized successfully.');
