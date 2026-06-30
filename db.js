import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MangoDB_URI

async function connectDB() {
  if (!MONGO_URI || MONGO_URI.includes('your_mongodb_connection_string')) {
    console.error('MONGO_URI is not set or is still a placeholder. Set MONGO_URI in .env to your Atlas connection string.')
    return
  }

  try {
    await mongoose.connect(MONGO_URI)

    console.log('MongoDB connected')
  } catch (err) {
    console.error('MongoDB connection error:', err.message)
    throw err
  }
}

export default connectDB
export { mongoose }
