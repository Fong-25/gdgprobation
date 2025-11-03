import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import cookieParser from 'cookie-parser'
import path from 'path'
import authRoutes from './routes/auth.route.js'

dotenv.config()

const app = express()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send('Server is running')
})

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`);
});