import express from 'express'
import {
    addThought,
    getThoughts,
    getThought,
    editThought,
    removeThought
} from '../controllers/thought.controller.js'
import { authMiddleware } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.get('/', authMiddleware, getThoughts)
router.get('/:id', authMiddleware, getThought)
router.post('/', authMiddleware, addThought)
router.put('/:id', authMiddleware, editThought)
router.delete('/:id', authMiddleware, removeThought)

export default router