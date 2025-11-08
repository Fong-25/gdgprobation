import {
    createMood,
    getMoodsByUserId,
    getMoodById,
    validateMoodCoordinates,
    deleteMood
} from '../services/mood.service.js'

export const addMood = async (req, res) => {
    try {
        const { moodX, moodY } = req.body
        const userId = req.userId // from auth middleware

        const validation = validateMoodCoordinates(moodX, moodY)
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message })
        }

        const newMood = await createMood({
            userId,
            moodX,
            moodY,
        })

        return res.status(201).json({
            message: 'Mood created successfully',
            mood: newMood,
        })
    } catch (error) {
        console.error('Add mood error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getMoods = async (req, res) => {
    try {
        const userId = req.userId // from auth middleware

        const moods = await getMoodsByUserId(userId)

        return res.status(200).json({
            moods,
        })
    } catch (error) {
        console.error('Get moods error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getMood = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId // from auth middleware

        const mood = await getMoodById(parseInt(id))

        if (!mood) {
            return res.status(404).json({ message: 'Mood not found' })
        }

        // Check if mood belongs to user
        if (mood.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }

        return res.status(200).json({
            mood,
        })
    } catch (error) {
        console.error('Get mood error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const removeMood = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId // from auth middleware

        // First check if mood exists and belongs to user
        const mood = await getMoodById(parseInt(id))

        if (!mood) {
            return res.status(404).json({ message: 'Mood not found' })
        }

        if (mood.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }

        // Delete the mood
        await deleteMood(parseInt(id))

        return res.status(200).json({
            message: 'Mood deleted successfully'
        })
    } catch (error) {
        console.error('Delete mood error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}
