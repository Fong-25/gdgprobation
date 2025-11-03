import {
    createUser,
    validateEmail,
    getUserByEmail,
    getUserById,
    getUserByUsername,
} from '../services/user.service.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY

if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined in the environment variables');
}

export const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }

        if (!validateEmail(email)) {
            return res.status(400).json({ message: "Invalid email address" })
        }
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" })
        }
        const existingEmail = await getUserByEmail(email)
        const existingUser = await getUserByUsername(username)
        if (existingUser || existingEmail) {
            return res.status(400).json({ message: 'User already exists' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = await createUser({
            username,
            email,
            password: hashedPassword,
        })
        return res.status(201).json({
            message: 'User registered successfully.',
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error('Sign up error:', error);
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) {
            return res.status(400).json({ message: 'All fields are required' })
        }
        const user = await getUserByUsername(username)
        if (!user) {
            return res.status(404).json({ message: 'Invalid credentials' })
        }
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }
        const token = jwt.sign({ userId: user.id, }, SECRET_KEY, { expiresIn: '30d' })

        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/',
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        })
        return res.status(200).json({ message: 'Login successfully' })
    } catch (error) {
        console.error('Log in error:', error);
        return res.status(500).json({ message: 'Internal server error' })
    }
}

export const logout = async (req, res) => {
    try {
        if (!req.cookies.token) {
            return res.status(400).json({ message: 'No user is logged in' })
        }
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        })
        return res.status(200).json({ message: 'Logged out successfully' })
    } catch (error) {
        console.error('Log out error:', error);
        return res.status(500).json({ message: 'Internal server error' })
    }
}