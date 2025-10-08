// simple DB connectivity check used by start.sh
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-hairstyle-pa';
console.log('Testing MongoDB connection to:', uri);

mongoose.connect(uri, { connectTimeoutMS: 5000 })
  .then(() => {
    console.log('\u2705 Connected to MongoDB');
    return mongoose.disconnect();
  })
  .then(() => process.exit(0))
  .catch(err => {
    console.error('\u274C Failed to connect to MongoDB:', err.message || err);
    process.exit(1);
  });
