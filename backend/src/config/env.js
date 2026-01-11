require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGO_URI',
  'JWT_SECRET',
  'PORT'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease create a .env file with the required variables.');
  process.exit(1);
}

// Export environment variables
module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGO_URI: process.env.MONGO_URI,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d',
  
  // CORS Configuration
 CORS_ORIGIN: process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'],
  
  // Socket.IO Configuration
SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN
  ? process.env.SOCKET_CORS_ORIGIN.split(',')
  : ['http://localhost:5173'],
  
  // File Upload Configuration (optional)
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '5242880', // 5MB default
  
  // Rate Limiting (optional)
  RATE_LIMIT_WINDOW: process.env.RATE_LIMIT_WINDOW || '15', // minutes
  RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS || '100',
};