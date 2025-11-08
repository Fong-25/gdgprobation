import express from 'express'
import {
    addMood,
    getMoods,
    getMood,
    removeMood
} from '../controllers/mood.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/', authMiddleware, addMood)
router.get('/', authMiddleware, getMoods)
router.get('/:id', authMiddleware, getMood)
router.delete('/:id', authMiddleware, removeMood)

export default router