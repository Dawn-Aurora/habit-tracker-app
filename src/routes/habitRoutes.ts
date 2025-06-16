import express from 'express';
import * as habitController from '../controllers/habitController';

const router = express.Router();

router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
router.put('/:id', habitController.updateHabit);
router.delete('/:id', habitController.deleteHabit);

export default router;