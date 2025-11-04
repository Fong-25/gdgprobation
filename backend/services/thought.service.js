import prisma from "../config/prisma.js";

export const createThought = async ({ userId, text }) => {
    const thought = await prisma.thought.create({
        data: {
            userId,
            text
        },
        select: {
            id: true,
            userId: true,
            text: true,
            createdAt: true
        }
    })
    return thought
}

export const getThoughtsByUserId = async (userId) => {
    const thoughts = await prisma.thought.findMany({
        where: { userId },
        select: {
            id: true,
            text: true,
            createdAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    })
    return thoughts
}

export const getThoughtById = async (id) => {
    const thought = await prisma.thought.findUnique({
        where: { id },
        select: {
            id: true,
            text: true,
            userId: true,
            createdAt: true
        }
    })
    return thought
}

export const updateThought = async (id, { text }) => {
    const thought = await prisma.thought.update({
        where: { id },
        data: { text },
        select: {
            id: true,
            userId: true,
            text: true,
            createdAt: true
        }
    })
    return thought
}

export const deleteThought = async (id) => {
    const thought = await prisma.thought.delete({
        where: { id }
    })
    return thought
}

export const validateThoughtText = (text) => {
    if (!text || text.trim().length === 0) {
        return { isValid: false, message: 'Text cannot be empty' }
    }

    const words = text.trim().split(/\s+/)

    if (words.length > 5) {
        return { isValid: false, message: 'Text must be maximum 5 words' }
    }

    return { isValid: true }
}