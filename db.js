const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/myDatabase';

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('connected', () => {
    console.log('Connected to MongoDB');
});

db.on('error', (err) => {
    console.error('Error connecting to MongoDB:', err);
});

module.exports = mongoose;