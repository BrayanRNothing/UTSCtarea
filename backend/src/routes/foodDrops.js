const express = require('express');
const router = express.Router();
const foodDropsController = require('../controllers/foodDropsController');
const { verifyToken } = require('../middleware/authMiddleware');

// Rutas de FoodDrops
router.get('/available', foodDropsController.getAvailableDrops); // Público para explorar antes de entrar

// Rutas Protegidas
router.post('/', verifyToken, foodDropsController.createFoodDrop);
router.post('/:id/claim', verifyToken, foodDropsController.claimFoodDrop);
router.get('/claimed/:userId', verifyToken, foodDropsController.getClaimedDrops);
router.get('/donated/:donanteId', verifyToken, foodDropsController.getDonatedDrops);
router.put('/:id', verifyToken, foodDropsController.updateFoodDrop);
router.delete('/:id', verifyToken, foodDropsController.deleteFoodDrop);

module.exports = router;
