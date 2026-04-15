import { Router } from 'express';
import {
  listEventTypes,
  getEventTypeBySlug,
  getEventTypeById,
  createEventType,
  updateEventType,
  deleteEventType
} from '../controllers/eventTypeController.js';

const router = Router();

router.get('/', listEventTypes);
router.get('/:slug', getEventTypeBySlug);
router.get('/:id/details', getEventTypeById);
router.post('/', createEventType);
router.put('/:id', updateEventType);
router.delete('/:id', deleteEventType);

export default router;
