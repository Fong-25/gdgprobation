export const data = {
    "users": [
        { "id": 1, "username": "vibequeen", "email": "vq@genz.life", "password": "hashed1", "created_at": "2025-10-01 09:00:00" },
        { "id": 2, "username": "chilldude", "email": "cd@genz.life", "password": "hashed2", "created_at": "2025-10-01 10:00:00" }
    ],
    "thoughts": [
        { "id": 1, "user_id": 1, "text": "Slay today", "created_at": "2025-11-02 08:00:00" },
        { "id": 2, "user_id": 1, "text": "Glow up", "created_at": "2025-11-01 07:30:00" },
        { "id": 3, "user_id": 1, "text": "No cap", "created_at": "2025-10-31 09:15:00" },
        { "id": 4, "user_id": 2, "text": "Nap vibes", "created_at": "2025-11-02 14:00:00" },
        { "id": 5, "user_id": 2, "text": "Low battery", "created_at": "2025-11-01 16:45:00" },
        { "id": 6, "user_id": 2, "text": "Chill only", "created_at": "2025-10-31 13:20:00" }
    ],
    "moods": [
        { "id": 1, "user_id": 1, "mood_x": 0.8, "mood_y": 0.9, "created_at": "2025-11-02 08:05:00" },
        { "id": 2, "user_id": 1, "mood_x": 0.5, "mood_y": 0.7, "created_at": "2025-11-01 07:35:00" },
        { "id": 3, "user_id": 2, "mood_x": -0.3, "mood_y": 0.1, "created_at": "2025-11-02 14:05:00" },
        { "id": 4, "user_id": 2, "mood_x": -0.6, "mood_y": -0.4, "created_at": "2025-11-01 16:50:00" }
    ],
    "habits": [
        { "id": 1, "user_id": 1, "name": "Hydrate", "frequency": "per_day", "is_tracked": true, "created_at": "2025-10-01 09:05:00" },
        { "id": 2, "user_id": 1, "name": "Journal", "frequency": "per_day", "is_tracked": true, "created_at": "2025-10-15 10:00:00" },
        { "id": 3, "user_id": 2, "name": "Stretch", "frequency": "per_day", "is_tracked": true, "created_at": "2025-10-01 10:05:00" },
        { "id": 4, "user_id": 2, "name": "Read", "frequency": "per_day", "is_tracked": true, "created_at": "2025-10-20 11:00:00" }
    ],
    "habit_logs": [
        { "id": 1, "habit_id": 1, "progress": "3/3", "date": "2025-11-02" },
        { "id": 2, "habit_id": 1, "progress": "2/3", "date": "2025-11-01" },
        { "id": 3, "habit_id": 1, "progress": "3/3", "date": "2025-10-31" },
        { "id": 4, "habit_id": 2, "progress": "1/3", "date": "2025-11-02" },
        { "id": 5, "habit_id": 3, "progress": "1/3", "date": "2025-11-02" },
        { "id": 6, "habit_id": 3, "progress": "0/3", "date": "2025-11-01" },
        { "id": 7, "habit_id": 4, "progress": "2/3", "date": "2025-11-02" }
    ]
}