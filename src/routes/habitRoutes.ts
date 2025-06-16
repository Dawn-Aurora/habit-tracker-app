import { Router } from 'express';
import { getHabits, addHabit } from '../controllers/habitController';

const router = Router();

router.get('/', getHabits);
router.post('/', addHabit);

export default router;