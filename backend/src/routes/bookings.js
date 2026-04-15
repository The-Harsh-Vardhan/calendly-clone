import { Router } from 'express';
import {
  createBooking,
  listBookings,
  cancelBooking
} from '../controllers/bookingController.js';

const router = Router();

router.get('/', listBookings);
router.post('/', createBooking);
router.patch('/:id/cancel', cancelBooking);

export default router;
