import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import sellerRouter from './routes/sellerRoute.js'
import reviewRouter from './routes/reviewRoute.js'

// App config
const app = express()
const port = process.env.PORT || 5000

// Initialize connections
let isConnected = false
let isInitializing = false

const initializeConnections = async () => {
  if (!isConnected && !isInitializing) {
    isInitializing = true
    try {
      await connectDB()
      await connectCloudinary()
      isConnected = true
      console.log('Database and Cloudinary connected successfully')
    } catch (error) {
      console.error('Connection error:', error.message)
      // Don't throw error - allow server to run even if DB connection fails temporarily
      isConnected = false
    } finally {
      isInitializing = false
    }
  }
}

// Middlewares
app.use(express.json({ limit: '10mb' }))

// Enhanced CORS configuration for Vercel
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://ceylonadmin.vercel.app',
      'https://ceylonfrontend.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];
    
    // Check if the origin is allowed
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now to fix CORS issues
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'token'
  ],
  exposedHeaders: ['token'],
  optionsSuccessStatus: 200
}))

// Handle preflight OPTIONS requests explicitly
app.options('*', cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'token'
  ],
  exposedHeaders: ['token']
}))

// Initialize connections before handling requests
app.use(async (req, res, next) => {
  try {
    await initializeConnections()
    next()
  } catch (error) {
    console.error('Initialization error:', error.message)
    // Continue anyway - some endpoints may still work
    next()
  }
})

// API Endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/review', reviewRouter)

app.get('/', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Ceylon Backend API is working!',
    timestamp: new Date().toISOString(),
    status: isConnected ? 'connected' : 'disconnected'
  })
})

// Health check endpoint
app.get('/health', (req, res) => {
  const status = isConnected ? 200 : 503
  res.status(status).json({ 
    success: isConnected,
    message: isConnected ? 'Server is healthy' : 'Server is not healthy',
    database: isConnected ? 'connected' : 'disconnected'
  })
})

// Error handling middleware (should be after routes)
app.use((err, req, res, next) => {
  console.error('Server Error:', err)
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'File size too large'
    })
  }
  
  if (err.message && err.message.includes('Only images')) {
    return res.status(400).json({
      success: false,
      message: err.message
    })
  }
  
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      message: 'Server error occurred',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    })
  }
})

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log('Server started on PORT: ' + port)
    console.log('Server listening on http://localhost:' + port)
    console.log('Attempting to connect to MongoDB...')
  })
}

// Export for Vercel (ES module syntax)
export default app