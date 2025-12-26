import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import colors from 'colors';
import path from 'path';

// Route files
import authRoutes from './routes/auth.routes.js';
import contentRoutes from './routes/content.routes.js';
import userRoutes from './routes/user.routes.js';

import { notFound, errorHandler } from './middleware/error.middleware.js';

dotenv.config();
// connectDB(); // Removed: Using plain-text file storage instead

const app = express();

// --- START OF CORS CONFIGURATION ---
const allowedOrigins = [
    'http://localhost:5174',
    'http://localhost:5175',
   'http://localhost:5173',
   'https://drafting.onrender.com',
   'https://www.draftiteration.com',
   process.env.CLIENT_URL
].filter(Boolean);

app.use(express.static(path.join(process.cwd(), "public")));

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true
}));
// --- END OF CORS CONFIGURATION ---

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Routers
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
    res.send('Draft API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(
        `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
    );
});
