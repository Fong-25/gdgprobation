import express from 'express'
import {
    addHabitProgresses,
    listHabitProgresses,
} from '../controllers/progress.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/', authMiddleware, addHabitProgresses)
router.get('/', authMiddleware, listHabitProgresses)

export default router