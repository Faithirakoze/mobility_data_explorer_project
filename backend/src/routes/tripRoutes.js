const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

router.get('/', tripController.getAllTrips);
router.get('/analyze', tripController.analyzeTrips);
router.get('/ranked', tripController.rankTrips);
router.get('/:id', tripController.getTripById);
router.delete('/:id', tripController.deleteTrip);

module.exports = router;

