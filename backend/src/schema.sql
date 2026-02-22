CREATE TABLE IF NOT EXISTS Users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT CHECK(role IN ('DONANTE', 'RECOLECTOR')) NOT NULL,
    nombre_entidad TEXT NOT NULL,
    coordenadas_base TEXT NOT NULL -- formato "lat,lng" o similar
);

-- Tabla de Publicaciones (FoodDrops)
CREATE TABLE IF NOT EXISTS FoodDrops (
    id TEXT PRIMARY KEY,
    donante_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    ubicacion TEXT NOT NULL,
    foto TEXT,
    estado TEXT CHECK(estado IN ('DISPONIBLE', 'RESERVADO', 'ENTREGADO')) NOT NULL DEFAULT 'DISPONIBLE',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donante_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Tabla de Recolecciones (Claims)
CREATE TABLE IF NOT EXISTS Claims (
    id TEXT PRIMARY KEY,
    drop_id TEXT NOT NULL,
    recolector_id TEXT NOT NULL,
    hora_recogida_estimada DATETIME NOT NULL,
    FOREIGN KEY (drop_id) REFERENCES FoodDrops(id) ON DELETE CASCADE,
    FOREIGN KEY (recolector_id) REFERENCES Users(id) ON DELETE CASCADE
);
