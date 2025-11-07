# Eunoia - A Personal Wellness Dashboard

Eunoia is a full-stack web application designed for personal wellness and self-care. It allows users to track their habits, log their moods, and record their thoughts, providing powerful visualizations to help them understand their mental and emotional patterns.

## Key Features

- **Secure Authentication**: Standard user signup and login system using JWTs stored in secure, httpOnly cookies. Passwords are hashed using bcrypt.
- **Habit Tracking**: Create and manage daily, weekly, or monthly habits. Track completion with a 4-level progress system (0%, 33%, 66%, 100%) on a weekly calendar grid.
- **Mood Journaling**: Log your mood on an interactive 2D plane (Calmness vs. Happiness). View your mood history as plotted points and a time-series line chart.
- **Thought Network**: Record short, 5-word thoughts. The app generates a dynamic, interactive force-directed graph to visualize the co-occurrence and connections between the words in your thoughts.
- **Data History**: A separate "Logs" view provides a complete chronological history of all thoughts, moods, and habits ever entered.

## Tech Stack

| Area | Technology |
|------|------------|
| **Frontend** | React, Vite, React Router, Tailwind CSS<br>@nivo/line (for charts), lucide-react (icons)<br>HTML5 Canvas (for custom force-directed graph) |
| **Backend** | Node.js, Express.js |
| **Database** | PostgreSQL (Database)<br>Prisma (ORM) |
| **Authentication** | jsonwebtoken (JWTs), bcrypt (Hashing), cookie-parser |

## Database Schema

The application uses a PostgreSQL database managed by Prisma. The schema includes the following models:

- **User**: Stores user credentials (username, email, password).
- **Habit**: Stores user-defined habits (name, frequency, isTracked) and links to a User.
- **HabitLog**: Stores progress (progress, date) for a specific Habit.
- **Mood**: Stores mood entries as coordinates (moodX, moodY) and links to a User.
- **Thought**: Stores short text entries (text) and links to a User.

## Getting Started

To run this project locally, you will need to set up both the backend and frontend.

### Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend/` directory and add your database URL and a JWT secret:
   ```env
   # Example for a local PostgreSQL database
   DATABASE_URL="postgresql://user:password@localhost:5432/eunoia"
   
   # A strong, random string for JWTs
   SECRET_KEY="your_super_secret_key_here"
   ```

4. Run the Prisma migrations to set up your database schema:
   ```bash
   npx prisma migrate dev
   ```
   or
   ```bash
   npx prisma generate
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:5000` (or the port specified in your environment).

### Frontend Setup

1. In a new terminal, navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `frontend/` directory to point to your backend API:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the frontend development server:
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`.

