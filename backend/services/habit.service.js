import prisma from '../config/prisma.js'

export const createHabit = async ({ userId, name, frequency, isTracked }) => {
    const habit = await prisma.habit.create({
        data: {
            userId,
            name,
            frequency: 'per_day',
            isTracked: true,
        },
        select: {
            id: true,
            userId: true,
            name: true,
            frequency: true,
            isTracked: true,
            createdAt: true,
        }
    })
    return habit
}

export const getHabitsByUserId = async (userId) => {
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
        },
        orderBy: {
            createdAt: 'desc',
        },
    })
    return habits
}

export const getHabitById = async (id) => {
    const habit = await prisma.habit.findUnique({
        where: { id },
        select: {
            id: true,
            userId: true,
            name: true,
            frequency: true,
            isTracked: true,
            createdAt: true,
        },
    })
    return habit
}

export const updateHabit = async (id, { name, frequency, isTracked }) => {
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (frequency !== undefined) updateData.frequency = frequency
    if (isTracked !== undefined) updateData.isTracked = isTracked

    const habit = await prisma.habit.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            userId: true,
            name: true,
            frequency: true,
            isTracked: true,
            createdAt: true,
        },
    })
    return habit
}

export const deleteHabit = async (id) => {
    const habit = await prisma.habit.delete({
        where: { id },
    })
    return habit
}

export const validateFrequency = (frequency) => {
    const validFrequencies = ['per_day', 'per_week', 'per_month']
    return validFrequencies.includes(frequency)
}