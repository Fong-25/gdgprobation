import prisma from "../config/prisma.js";

export const createMood = async ({ userId, moodX, moodY }) => {
    const mood = prisma.mood.create({
        data: {
            userId,
            moodX,
            moodY
        },
        select: {
            id: true,
            userId: true,
            moodX: true,
            moodY: true,
            createdAt: true
        }
    })
    return mood
}

export const getMoodsByUserId = async (userId) => {
    const moods = prisma.mood.findMany({
        where: { userId },
        select: {
            id: true,
            moodX: true,
            moodY: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    return moods
}

export const getMoodById = async (id) => {
    const mood = prisma.mood.findUnique({
        where: { id },
        select: {
            id: true,
            userId: true,
            moodX: true,
            moodY: true,
            createdAt: true
        }
    })
    return mood
}

export const validateMoodCoordinates = (moodX, moodY) => {
    if (moodX === undefined || moodY === undefined) {
        return { isValid: false, message: 'Both moodX and moodY are required' }
    }

    if (typeof moodX !== 'number' || typeof moodY !== 'number') {
        return { isValid: false, message: 'moodX and moodY must be numbers' }
    }

    if (moodX < -1 || moodX > 1) {
        return { isValid: false, message: 'moodX must be between -1 and 1' }
    }

    if (moodY < -1 || moodY > 1) {
        return { isValid: false, message: 'moodY must be between -1 and 1' }
    }

    return { isValid: true }
}