import {
    createHabit,
    getHabitsByUserId,
    getHabitById,
    updateHabit,
    deleteHabit,
    validateFrequency
} from '../services/habit.service.js'

export const addHabit = async (req, res) => {
    try {
        const { name, frequency, isTracked } = req.body
        console.log(name)
        const userId = req.user.userId
        if (!name) {
            return res.status(400).json({ message: 'Name and isTracked are required' })
        }

        const habitFrequency = frequency || 'per_day'

        if (!validateFrequency(habitFrequency)) {
            return res.status(400).json({ message: 'Invalid frequency. Must be per_day, per_week, or per_month' })
        }

        const newHabit = await createHabit({
            userId,
            name,
            frequency: habitFrequency,
            isTracked,
        })

        return res.status(201).json({
            message: 'Habit created successfully',
            habit: newHabit,
        })
    } catch (error) {
        console.error('Add habit error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getHabits = async (req, res) => {
    try {
        const userId = req.user.userId
        const habits = await getHabitsByUserId(userId)
        return res.status(200).json({
            message: 'Habits fetched successfully',
            habits,
        })
    } catch (error) {
        console.error('Get habits error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const getHabit = async (req, res) => {
    try {
        const { id } = req.params
        const habit = await getHabitById(parseInt(id))
        const userId = req.userId
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' })
        }
        // Check if habit belongs to user
        if (habit.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }
        return res.status(200).json({
            message: 'Habit fetched successfully',
            habit,
        })
    } catch (error) {
        console.error('Get habit by id error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const editHabit = async (req, res) => {
    try {
        const { id } = req.params
        const { name, frequency, isTracked } = req.body
        const userId = req.userId // from auth middleware

        const habit = await getHabitById(parseInt(id))

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' })
        }
        // Check if habit belongs to user
        if (habit.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }
        if (frequency && !validateFrequency(frequency)) {
            return res.status(400).json({ message: 'Invalid frequency. Must be per_day, per_week, or per_month' })
        }

        const updatedHabit = await updateHabit(parseInt(id), {
            name,
            frequency,
            isTracked,
        })

        return res.status(200).json({
            message: 'Habit updated successfully',
            habit: updatedHabit,
        })

    } catch (error) {
        console.error('Edit habit error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const removeHabit = async (req, res) => {
    try {
        const { id } = req.params
        const userId = req.userId // from auth middleware

        const habit = await getHabitById(parseInt(id))

        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' })
        }

        // Check if habit belongs to user
        if (habit.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }

        await deleteHabit(parseInt(id))

        return res.status(200).json({
            message: 'Habit deleted successfully',
        })
    } catch (error) {
        console.error('Remove habit error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}