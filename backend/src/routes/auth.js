const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rutas de Autenticación
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout); // Limpia la cookie HttpOnly

// Rutas Protegidas
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;
