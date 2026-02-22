const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const cookieParser = require('cookie-parser');

// Load environment variables
dotenv.config();

const app = express();
const HTTP_PORT = process.env.PORT || 5000;
const HTTPS_PORT = process.env.HTTPS_PORT || 5443;

// Middleware
// Permitir credenciales (cookies) desde el frontend de Vite
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'https://localhost:5173',
    'http://127.0.0.1:5173',
    'https://127.0.0.1:5173'
  ].filter(Boolean),
  credentials: true,
}));
app.use(cookieParser());
// Aumentamos el límite a 10mb para soportar imágenes base64
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'FoodDrop API - OK' });
});

const foodDropsRoutes = require('./routes/foodDrops');
const authRoutes = require('./routes/auth');

app.use('/api/food-drops', foodDropsRoutes);
app.use('/api/auth', authRoutes);

// Intentar levantar HTTPS si existen los certificados
const certPath = path.join(__dirname, '..', 'certs', 'cert.pem');
const keyPath = path.join(__dirname, '..', 'certs', 'key.pem');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  const sslOptions = {
    key: fs.readFileSync(keyPath),
    cert: fs.readFileSync(certPath),
  };
  https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
    console.log(`🔒 HTTPS server running on https://localhost:${HTTPS_PORT}`);
  });
} else {
  console.warn('⚠️  Certificados SSL no encontrados. Corriendo en HTTP (solo desarrollo).');
  console.warn('   Genera los certs con: node src/generate-certs.js');
}

// Servidor HTTP siempre disponible (para que el frontend no tenga que cambiar puerto)
http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`🌐 HTTP  server running on http://localhost:${HTTP_PORT}`);
});

module.exports = app;

