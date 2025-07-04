// // Required dependencies
// const express = require('express');
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const multer = require('multer');
// const path = require('path');
// const cors = require('cors');

// const app = express();
// app.use(express.json());
// app.use(cors());

// // MongoDB connection
// mongoose.connect('mongodb://localhost:27017/mann_pasandh', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// // User Schema
// const userSchema = new mongoose.Schema({
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }]
// });

// // Playlist Schema
// const playlistSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
//     coverImage: String
// });

// // Song Schema
// const songSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     artist: { type: String, required: true },
//     filepath: { type: String, required: true },
//     duration: Number,
//     genre: String
// });

// const User = mongoose.model('User', userSchema);
// const Playlist = mongoose.model('Playlist', playlistSchema);
// const Song = mongoose.model('Song', songSchema);

// // File upload configuration
// const storage = multer.diskStorage({
//     destination: './uploads/songs',
//     filename: (req, file, cb) => {
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage });

// // Authentication middleware
// const auth = async (req, res, next) => {
//     try {
//         const token = req.header('Authorization').replace('Bearer ', '');
//         const decoded = jwt.verify(token, 'your_jwt_secret');
//         const user = await User.findOne({ _id: decoded._id });
        
//         if (!user) {
//             throw new Error();
//         }
        
//         req.user = user;
//         req.token = token;
//         next();
//     } catch (error) {
//         res.status(401).send({ error: 'Please authenticate.' });
//     }
// };

// app.get('/login', (req, res) => {
//   res.sendFile(path.join(__dirname, 'login_music.html')); // Serve login page
// });


// // User Routes
// app.post('/api/users/register', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const hashedPassword = await bcrypt.hash(password, 8);
//         const user = new User({ email, password: hashedPassword });
//         await user.save();
        
//         const token = jwt.sign({ _id: user._id }, 'your_jwt_secret');
//         res.status(201).send({ user, token });
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// app.post('/api/users/login', async (req, res) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });
        
//         if (!user) {
//             throw new Error('Invalid login credentials');
//         }
        
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             throw new Error('Invalid login credentials');
//         }
        
//         const token = jwt.sign({ _id: user._id }, 'your_jwt_secret');
//         res.send({ user, token });
//     } catch (error) {
//         res.status(400).send(error.message);
//     }
// });

// // Playlist Routes
// app.post('/api/playlists', auth, async (req, res) => {
//     try {
//         const playlist = new Playlist({
//             ...req.body,
//             creator: req.user._id
//         });
//         await playlist.save();
//         res.status(201).send(playlist);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// app.get('/api/playlists', auth, async (req, res) => {
//     try {
//         const playlists = await Playlist.find({ creator: req.user._id })
//             .populate('songs');
//         res.send(playlists);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

// // Song Routes
// app.post('/api/songs', auth, upload.single('song'), async (req, res) => {
//     try {
//         const song = new Song({
//             ...req.body,
//             filepath: req.file.path
//         });
//         await song.save();
//         res.status(201).send(song);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// app.get('/api/songs/:id', auth, async (req, res) => {
//     try {
//         const song = await Song.findById(req.params.id);
//         if (!song) {
//             return res.status(404).send();
//         }
//         res.sendFile(path.resolve(song.filepath));
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });

// // Add song to playlist
// app.post('/api/playlists/:id/songs', auth, async (req, res) => {
//     try {
//         const playlist = await Playlist.findById(req.params.id);
//         const song = await Song.findById(req.body.songId);
        
//         if (!playlist || !song) {
//             return res.status(404).send();
//         }
        
//         playlist.songs.push(song._id);
//         await playlist.save();
//         res.send(playlist);
//     } catch (error) {
//         res.status(400).send(error);
//     }
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });




const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const app = express();

// Constants
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Should be in .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mann_pasandh';
const PORT = process.env.PORT || 3001;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Middleware setup
app.use(express.json());
app.use(express.static('public'));
app.use(cors({
    origin: CLIENT_URL,
    credentials: true
}));

// MongoDB connection with retry logic
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

connectDB();

// Schemas
const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
            message: 'Invalid email format'
        }
    },
    password: { 
        type: String, 
        required: true,
        minlength: 8
    },
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
    createdAt: { type: Date, default: Date.now }
});

const playlistSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 100
    },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    coverImage: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const songSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 200
    },
    artist: { 
        type: String, 
        required: true,
        trim: true,
        maxlength: 200
    },
    filepath: { 
        type: String, 
        required: true 
    },
    duration: Number,
    genre: String,
    createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Playlist = mongoose.model('Playlist', playlistSchema);
const Song = mongoose.model('Song', songSchema);

// File upload configuration with file type validation
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/songs');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Authentication middleware
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            throw new Error('No authentication token provided');
        }
        
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id });
        
        if (!user) {
            throw new Error('User not found');
        }
        
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send({ 
            error: 'Authentication failed',
            message: error.message
        });
    }
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts. Please try again later.'
});

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/js_images', express.static(path.join(__dirname, 'js_images')));

// Static routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/login', (req, res) => {
 res.sendFile(path.join(__dirname, 'login_music.html')); // Serve login page
 });

app.get('/library', auth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'music_playlist_library.html'));
});

// API Routes
app.post('/api/users/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).send({ message: 'Email and password are required' });
        }
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ message: 'Email already registered' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({ email, password: hashedPassword });
        await user.save();
        
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '24h' });
        res.status(201).send({ 
            user: { email: user.email }, 
            token 
        });
    } catch (error) {
        res.status(400).send({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }
});

app.post('/api/users/login', authLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '24h' });
        res.send({ 
            user: { email: user.email }, 
            token 
        });
    } catch (error) {
        res.status(400).send({ 
            message: 'Login failed', 
            error: error.message 
        });
    }
});

// Playlist routes
app.post('/api/playlists', auth, async (req, res) => {
    try {
        const playlist = new Playlist({
            ...req.body,
            creator: req.user._id
        });
        await playlist.save();
        
        // Add playlist to user's playlists array
        req.user.playlists.push(playlist._id);
        await req.user.save();
        
        res.status(201).send(playlist);
    } catch (error) {
        res.status(400).send({ 
            message: 'Failed to create playlist', 
            error: error.message 
        });
    }
});

app.get('/api/playlists', auth, async (req, res) => {
    try {
        const playlists = await Playlist.find({ creator: req.user._id })
            .populate({
                path: 'songs',
                select: '-__v'
            })
            .select('-__v')
            .sort({ updatedAt: -1 });
            
        res.send(playlists);
    } catch (error) {
        res.status(500).send({ 
            message: 'Failed to fetch playlists', 
            error: error.message 
        });
    }
});

// Song routes
app.post('/api/songs', auth, upload.single('song'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No audio file uploaded' });
        }

        const song = new Song({
            ...req.body,
            filepath: req.file.path
        });
        await song.save();
        res.status(201).send(song);
    } catch (error) {
        res.status(400).send({ 
            message: 'Failed to upload song', 
            error: error.message 
        });
    }
});

app.get('/api/songs/:id', auth, async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).send({ message: 'Song not found' });
        }
        res.sendFile(path.resolve(song.filepath));
    } catch (error) {
        res.status(500).send({ 
            message: 'Failed to fetch song', 
            error: error.message 
        });
    }
});

// Add song to playlist
app.post('/api/playlists/:id/songs', auth, async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) {
            return res.status(404).send({ message: 'Playlist not found' });
        }
        
        if (playlist.creator.toString() !== req.user._id.toString()) {
            return res.status(403).send({ message: 'Not authorized to modify this playlist' });
        }
        
        const song = await Song.findById(req.body.songId);
        if (!song) {
            return res.status(404).send({ message: 'Song not found' });
        }
        
        if (!playlist.songs.includes(song._id)) {
            playlist.songs.push(song._id);
            playlist.updatedAt = Date.now();
            await playlist.save();
        }
        
        res.send(playlist);
    } catch (error) {
        res.status(400).send({ 
            message: 'Failed to add song to playlist', 
            error: error.message 
        });
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
    console.error('Server failed to start:', err);
    process.exit(1);
});