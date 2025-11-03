import express from 'express'
import {
    addHabit,
    getHabits,
    getHabit,
    editHabit,
    removeHabit,
} from '../controllers/habit.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/', authMiddleware, addHabit)
router.get('/', authMiddleware, getHabits)
router.get('/:id', authMiddleware, getHabit)
router.put('/:id', authMiddleware, editHabit)
router.delete('/:id', authMiddleware, removeHabit)

export default router