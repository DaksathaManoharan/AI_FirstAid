import express from 'express';
import { 
  getNearbyResources, 
  getNearbyAEDs, 
  getResourceById, 
  reverseGeocode,
  searchLocation 
} from '../controllers/resourceController.js';

const router = express.Router();

router.get('/search-location', searchLocation);
router.get('/reverse-geocode', reverseGeocode);
router.get('/nearby', getNearbyResources);
router.get('/aed/nearby', getNearbyAEDs);
router.get('/:id', getResourceById);

export default router;
