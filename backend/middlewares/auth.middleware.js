import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const SECRET_KEY = process.env.SECRET_KEY

if (!SECRET_KEY) {
    throw new Error('SECRET_KEY is not defined in the environment variables');
}

export const authMiddleware = (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded; // { userId: ... }
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};