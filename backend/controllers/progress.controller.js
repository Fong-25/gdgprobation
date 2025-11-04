import {
    createHabitLog,
    getHabitLogsForDate,
    updateHabitLog,
    getHabitsWithProgress,
    validateProgress,
} from '../services/progress.service.js'
import { getHabitById } from '../services/habit.service.js'

export const addHabitProgresses = async (req, res) => {
    try {
        const { habitId, progress, date } = req.body
        const userId = req.userId // from auth middleware

        if (!habitId || progress === undefined || !date) {
            return res.status(400).json({ message: 'habitId, progress, and date are required' })
        }

        // Validate progress value
        const validation = validateProgress(progress)
        if (!validation.isValid) {
            return res.status(400).json({ message: validation.message })
        }

        // Check if habit exists and belongs to user
        const habit = await getHabitById(habitId)
        if (!habit) {
            return res.status(404).json({ message: 'Habit not found' })
        }
        if (habit.userId !== userId) {
            return res.status(403).json({ message: 'Access denied' })
        }

        // Parse date string to Date object
        const [year, month, day] = date.split('-')
        const parsedDate = new Date(Date.UTC(year, month - 1, day))
        parsedDate.setUTCHours(0, 0, 0, 0) // ensure clean midnight UTC
        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' })
        }

        // Check if log already exists for this habit and date
        const existingLog = await getHabitLogsForDate(habitId, parsedDate)

        let habitLog
        if (existingLog) {
            // Update existing log
            habitLog = await updateHabitLog(existingLog.id, progress)
        } else {
            // Create new log
            habitLog = await createHabitLog({
                habitId,
                progress,
                date: parsedDate,
            })
        }

        return res.status(existingLog ? 200 : 201).json({
            message: existingLog ? 'Progress updated successfully' : 'Progress created successfully',
            habitLog: {
                ...habitLog,
                progress: parseFloat(habitLog.progress),
            },
        })
    } catch (error) {
        console.error('Add habit progress error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const listHabitProgresses = async (req, res) => {
    try {
        const userId = req.userId // from auth middleware
        const { date } = req.query

        // Use today's date if not provided
        let queryDate
        if (date) {
            const [y, m, d] = date.split('-')
            queryDate = new Date(Date.UTC(y, m - 1, d))
        } else {
            queryDate = new Date()
            queryDate.setUTCHours(0, 0, 0, 0)
            // Truncate to UTC midnight of today
            const offset = queryDate.getTimezoneOffset()
            queryDate = new Date(queryDate.getTime() - offset * 60 * 1000)
        }
        queryDate = new Date(queryDate.toISOString().split('T')[0])

        if (isNaN(queryDate.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' })
        }

        const habits = await getHabitsWithProgress(userId, queryDate)

        return res.status(200).json({
            habits,
            date: queryDate.toISOString().split('T')[0],
        })
    } catch (error) {
        console.error('List habit progresses error:', error)
        return res.status(500).json({ message: 'Internal server error' })
    }
}