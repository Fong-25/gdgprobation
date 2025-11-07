import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import cookieParser from 'cookie-parser'
import path from 'path'
import authRoutes from './routes/auth.route.js'
import habitRoutes from './routes/habit.route.js'
import thoughtRoutes from './routes/thought.route.js'
import moodRoutes from './routes/mood.route.js'
import progressRoutes from './routes/progress.route.js'

dotenv.config()

const app = express()
const __dirname = path.resolve()

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get(/^(?!\/api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

app.get('/', (req, res) => {
    res.send('Server is running')
})

app.use('/api/auth', authRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/thoughts', thoughtRoutes)
app.use('/api/moods', moodRoutes)
app.use('/api/progress', progressRoutes)

app.listen(PORT, () => {
    connectDB()
    console.log(`Server is running on port ${PORT}`);
});