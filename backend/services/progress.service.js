import prisma from '../config/prisma.js'

export const createHabitLog = async ({ habitId, progress, date }) => {
    const habitLog = await prisma.habitLog.create({
        data: {
            habitId,
            progress,
            date,
        },
        select: {
            id: true,
            habitId: true,
            progress: true,
            date: true,
        },
    })
    return habitLog
}

export const getHabitLogsForDate = async (habitId, date) => {
    const habitLog = await prisma.habitLog.findFirst({
        where: {
            habitId,
            date,
        },
        select: {
            id: true,
            habitId: true,
            progress: true,
            date: true,
        },
    })
    return habitLog
}

export const updateHabitLog = async (id, progress) => {
    const habitLog = await prisma.habitLog.update({
        where: { id },
        data: { progress },
        select: {
            id: true,
            habitId: true,
            progress: true,
            date: true,
        },
    })
    return habitLog
}

export const getHabitsWithProgress = async (userId, date) => {
    const habits = await prisma.habit.findMany({
        where: {
            userId,
        },
        select: {
            id: true,
            name: true,
            frequency: true,
            isTracked: true,
            createdAt: true,
            habitLogs: {
                where: {
                    date,
                },
                select: {
                    id: true,
                    progress: true,
                    date: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    // Transform to include progress directly
    return habits.map(habit => ({
        id: habit.id,
        name: habit.name,
        frequency: habit.frequency,
        isTracked: habit.isTracked,
        createdAt: habit.createdAt,
        progress: habit.habitLogs.length > 0 ? parseFloat(habit.habitLogs[0].progress) : 0,
        logId: habit.habitLogs.length > 0 ? habit.habitLogs[0].id : null,
    }))
}

export const validateProgress = (progress) => {
    const validProgresses = [0, 1 / 3, 2 / 3, 1]

    // Check if progress is a number
    if (typeof progress !== 'number') {
        return { isValid: false, message: 'Progress must be a number' }
    }

    // Check if progress matches one of the valid values (with small tolerance for floating point)
    const isValid = validProgresses.some(valid => Math.abs(progress - valid) < 0.001)

    if (!isValid) {
        return { isValid: false, message: 'Progress must be 0, 0.333, 0.667, or 1' }
    }

    return { isValid: true }
}