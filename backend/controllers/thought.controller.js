import {
    createThought,
    getThoughtById,
    getThoughtsByUserId,
    updateThought,
    deleteThought,
    validateThoughtText
} from '../services/thought.service.js'

export const addThought = async (req, res) => {
    try {
        const { text } = req.body
        const userId = req.userId

        if (!text) {
            return res.status(400).json({ message: "Text is required" })
        }
        const validation = validateThoughtText(text)
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message })
        }
        const newThought = await createThought({
            text: text.trim(),
            userId
        })
        return res.status(201).json({
            message: "Thought create successfully",
            newThought
        })
    } catch (error) {
        console.error('Add thought error', error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getThoughts = async (req, res) => {
    try {
        const userId = req.userId
        const thoughts = await getThoughtsByUserId(userId)

        return res.status(200).json({ thoughts })
    } catch (error) {
        console.error('Add thought error', error)
        return res.status(500).json({ message: "Internal server error" })
    }
}

export const getThought = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId // from auth middleware

        const thought = await getThoughtById(parseInt(id))

        if (!thought) {
            return res.status(404).json({ message: 'Thought not found' })
        }

        // Check if thought belongs to user
        if (thought.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }

        return res.status(200).json({
            thought,
        })
    } catch (error) {
        console.error('Get thought error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const editThought = async (req, res) => {
    try {
        const { id } = req.params
        const { text } = req.body
        const userId = req.userId // from auth middleware

        if (!text) {
            return res.status(400).json({ message: 'Text is required' })
        }

        const validation = validateThoughtText(text)
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message })
        }

        const thought = await getThoughtById(parseInt(id))

        if (!thought) {
            return res.status(404).json({ message: 'Thought not found' })
        }

        // Check if thought belongs to user
        if (thought.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }

        const updatedThought = await updateThought(parseInt(id), {
            text: text.trim(),
        })

        return res.status(200).json({
            message: 'Thought updated successfully',
            thought: updatedThought,
        })
    } catch (error) {
        console.error('Edit thought error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const removeThought = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId // from auth middleware

        const thought = await getThoughtById(parseInt(id))

        if (!thought) {
            return res.status(404).json({ message: 'Thought not found' })
        }

        // Check if thought belongs to user
        if (thought.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }

        await deleteThought(parseInt(id))

        return res.status(200).json({
            message: 'Thought deleted successfully',
        })
    } catch (error) {
        console.error('Remove thought error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}