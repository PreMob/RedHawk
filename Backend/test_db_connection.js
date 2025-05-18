const mongoose = require('mongoose');
const ScanResult = require('./models/ScanResult');

// MongoDB connection string - using the same as in server.js
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/redhawk';

// Connect to MongoDB
console.log(`Attempting to connect to MongoDB at: ${MONGO_URI}`);
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000
}).then(async () => {
  console.log(`MongoDB Connected: ${MONGO_URI.split('@').pop() || 'localhost'}`);
  
  try {
    // Count the number of scan results
    const count = await ScanResult.countDocuments({});
    console.log(`Total scan results in database: ${count}`);
    
    // Get the most recent scan results
    const recentScans = await ScanResult.find()
      .sort('-scanDate')
      .limit(5)
      .select('targetUrl scanDate summary vulnerabilities');
    
    console.log('\nRecent scan results:');
    if (recentScans.length === 0) {
      console.log('No scan results found in the database.');
    } else {
      recentScans.forEach((scan, index) => {
        console.log(`\n[${index + 1}] Scan ID: ${scan._id}`);
        console.log(`   URL: ${scan.targetUrl}`);
        console.log(`   Date: ${scan.scanDate}`);
        console.log(`   Summary: ${scan.summary}`);
        console.log(`   Vulnerabilities: ${scan.vulnerabilities.length}`);
      });
    }
  } catch (err) {
    console.error('Error fetching scan results:', err.message);
  } finally {
    // Close the connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}).catch(err => {
  console.error(`MongoDB Connection Error: ${err.message}`);
}); 