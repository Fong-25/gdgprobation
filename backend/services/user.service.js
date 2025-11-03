import prisma from '../config/prisma.js'

export const createUser = async ({ username, email, password }) => {
    const user = prisma.user.create({
        data: {
            username,
            email,
            password,
        },
        select: {
            id: true,
            username: true,
            email: true,
            createdAt: true,
        },
    })
    return user
}

export const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return regex.test(email)
}

export const getUserByEmail = async (email) => {
    const user = prisma.user.findUnique({
        where: {
            email,
        },
    })
    return user
}

export const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id }
    })
    return user
}

export const getUserByUsername = async (username) => {
    const user = await prisma.user.findUnique({
        where: { username }
    })
    return user
}