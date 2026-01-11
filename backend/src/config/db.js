const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGO_URI exists
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('🔄 Attempting to connect to MongoDB...');
    
    // Hide password in logs for security
    const safeUri = process.env.MONGO_URI.replace(/:[^:@]+@/, ':****@');
    console.log('📍 Connection string:', safeUri);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });

    console.log('✅ MongoDB Connected Successfully!');
    console.log(`📊 Host: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    console.log(`📊 Port: ${conn.connection.port}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n📴 ${signal} received. Closing MongoDB connection...`);
      await mongoose.connection.close();
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('=' .repeat(60));
    console.error('❌ MongoDB Connection Failed!');
    console.error('=' .repeat(60));
    console.error('Error:', error.message);
    console.error('');
    
    // Provide helpful error messages based on error type
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.error('🔑 Authentication Error - Check your credentials:');
      console.error('   1. Verify username and password in MongoDB Atlas');
      console.error('   2. URL-encode special characters in password:');
      console.error('      @ → %40, # → %23, $ → %24, % → %25');
      console.error('   3. Example: MyP@ss#123 → MyP%40ss%23123');
      console.error('');
      console.error('📍 Set MONGO_URI in Render environment variables');
    } else if (error.message.includes('MONGO_URI is not defined')) {
      console.error('⚙️ Environment Variable Missing:');
      console.error('   Set MONGO_URI in Render dashboard → Environment');
      console.error('   Format: mongodb+srv://user:pass@cluster.net/dbname');
    } else if (error.message.includes('querySrv ENOTFOUND') || error.message.includes('ENOTFOUND')) {
      console.error('🌐 Network Error:');
      console.error('   1. Check your MongoDB cluster URL is correct');
      console.error('   2. Verify your internet connection');
      console.error('   3. Check MongoDB Atlas status');
    } else if (error.message.includes('IP') || error.message.includes('not authorized')) {
      console.error('🔒 IP Whitelist Error:');
      console.error('   Add 0.0.0.0/0 to Network Access in MongoDB Atlas');
      console.error('   This allows connections from any IP (required for Render)');
    } else {
      console.error('💡 General troubleshooting:');
      console.error('   1. Verify MONGO_URI is set in Render environment');
      console.error('   2. Check MongoDB Atlas cluster is running');
      console.error('   3. Verify Network Access allows 0.0.0.0/0');
      console.error('   4. Check Database Access user has proper permissions');
    }
    
    console.error('=' .repeat(60));
    process.exit(1);
  }
};

module.exports = connectDB;