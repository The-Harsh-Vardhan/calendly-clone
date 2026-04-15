import { Router } from 'express';
import {
  getAvailability,
  updateAvailability,
  getAvailableSlots
} from '../controllers/availabilityController.js';

const router = Router();

router.get('/', getAvailability);
router.put('/', updateAvailability);
router.get('/:slug/:date', getAvailableSlots);

export default router;
