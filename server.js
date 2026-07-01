import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'
import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'
import sharp from 'sharp'
import ffmpeg from 'fluent-ffmpeg'
import connectDB from './db.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'portfolio-secret'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@portfolio.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345'
const uploadDir = path.join(process.cwd(), 'uploads')

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(uploadDir))

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(null, `${uniqueSuffix}-${file.originalname}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  },
})

const mediaUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for media
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image, video, or audio files are allowed'))
    }
  },
})

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'admin' },
  },
  { timestamps: true }
)

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: [{ type: String }],
    github: { type: String },
    image: { type: String },
  },
  { timestamps: true }
)

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    level: { type: Number, required: true, min: 0, max: 100 },
    category: { type: String, default: 'Frontend' },
  },
  { timestamps: true }
)

const educationSchema = new mongoose.Schema(
  {
    school: { type: String, required: true },
    degree: { type: String, required: true },
    year: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
)

const certificateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    issuedAt: { type: String, required: true },
    credentialUrl: { type: String },
    image: { type: String },
  },
  { timestamps: true }
)

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    subject: { type: String, default: 'Portfolio Contact' },
    status: { type: String, enum: ['new', 'replied'], default: 'new' },
  },
  { timestamps: true }
)

const User = mongoose.model('User', userSchema)
const Project = mongoose.model('Project', projectSchema)
const Skill = mongoose.model('Skill', skillSchema)
const Education = mongoose.model('Education', educationSchema)
const Certificate = mongoose.model('Certificate', certificateSchema)
const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema)

async function ensureDefaultAdmin() {
  try {
    const exists = await User.findOne({ role: 'admin' })
    if (exists) {
      return
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10)
    await User.create({
      name: 'Admin',
      email: ADMIN_EMAIL,
      password: hashedPassword,
      role: 'admin',
    })
  } catch (error) {
    console.warn('Admin seed skipped:', error.message)
  }
}

function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' })
}

async function uploadFile(req) {
  if (!req.file) {
    return null
  }

  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    const result = await cloudinary.uploader.upload(req.file.path, { folder: 'portfolio' })
    fs.unlinkSync(req.file.path)
    return result.secure_url
  }

  return `/uploads/${req.file.filename}`
}

function protect(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' })
  }
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/dbtest', (_req, res) => {
  const state = mongoose.connection.readyState
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }
  res.json({ mongo_state: states[state] || state })
})

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const user = await User.findOne({ email })

    if (!user) {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        const token = generateToken({ _id: 'admin', email: ADMIN_EMAIL, role: 'admin' })
        return res.json({ token, user: { email: ADMIN_EMAIL, role: 'admin' } })
      }

      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user)
    res.json({ token, user: { email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/admin/login', async (req, res) => {
  const { email, password } = req.body

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = generateToken({ _id: 'admin', email: ADMIN_EMAIL, role: 'admin' })
    return res.json({ token, user: { email: ADMIN_EMAIL, role: 'admin' } })
  }

  return res.status(401).json({ message: 'Invalid admin credentials' })
})

app.get('/api/projects', async (_req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/projects', protect, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await uploadFile(req)
    const project = await Project.create({
      ...req.body,
      tags: req.body.tags ? req.body.tags.split(',') : [],
      image: imageUrl,
    })
    res.status(201).json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.put('/api/projects/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await uploadFile(req)
    const payload = { ...req.body }
    if (payload.tags) {
      payload.tags = payload.tags.split(',')
    }
    if (imageUrl) {
      payload.image = imageUrl
    }
    const project = await Project.findByIdAndUpdate(req.params.id, payload, { new: true })
    res.json(project)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/projects/:id', protect, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id)
    res.json({ message: 'Project deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/skills', async (_req, res) => {
  try {
    const skills = await Skill.find().sort({ createdAt: -1 })
    res.json(skills)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/skills', protect, async (req, res) => {
  try {
    const skill = await Skill.create(req.body)
    res.status(201).json(skill)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.put('/api/skills/:id', protect, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(skill)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/skills/:id', protect, async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id)
    res.json({ message: 'Skill deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/education', async (_req, res) => {
  try {
    const education = await Education.find().sort({ createdAt: -1 })
    res.json(education)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/education', protect, async (req, res) => {
  try {
    const entry = await Education.create(req.body)
    res.status(201).json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.put('/api/education/:id', protect, async (req, res) => {
  try {
    const entry = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.json(entry)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/education/:id', protect, async (req, res) => {
  try {
    await Education.findByIdAndDelete(req.params.id)
    res.json({ message: 'Education deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/certificates', async (_req, res) => {
  try {
    const certificates = await Certificate.find().sort({ createdAt: -1 })
    res.json(certificates)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/certificates', protect, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await uploadFile(req)
    const certificate = await Certificate.create({ ...req.body, image: imageUrl })
    res.status(201).json(certificate)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.put('/api/certificates/:id', protect, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = await uploadFile(req)
    const payload = { ...req.body }
    if (imageUrl) {
      payload.image = imageUrl
    }
    const certificate = await Certificate.findByIdAndUpdate(req.params.id, payload, { new: true })
    res.json(certificate)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.delete('/api/certificates/:id', protect, async (req, res) => {
  try {
    await Certificate.findByIdAndDelete(req.params.id)
    res.json({ message: 'Certificate deleted' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.get('/api/contact', protect, async (_req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 })
    res.json(messages)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/contact', async (req, res) => {
  try {
    const message = await ContactMessage.create(req.body)

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.CONTACT_EMAIL || ADMIN_EMAIL,
        subject: `New portfolio contact from ${req.body.name}`,
        text: req.body.message,
      })
    }

    res.status(201).json({ message: 'Contact message received', data: message })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

app.post('/api/convert', mediaUpload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' })
  }

  try {
    const inputPath = req.file.path
    let outputPath = ''
    let outputFilename = ''

    if (req.file.mimetype.startsWith('image/')) {
      // Convert image to webp
      outputFilename = `converted-${Date.now()}.webp`
      outputPath = path.join(uploadDir, outputFilename)
      await sharp(inputPath).webp({ quality: 80 }).toFile(outputPath)
      
      fs.unlinkSync(inputPath)
      
      return res.json({ 
        message: 'Image converted successfully', 
        url: `/uploads/${outputFilename}` 
      })
    } else if (req.file.mimetype.startsWith('video/') || req.file.mimetype.startsWith('audio/')) {
      const isVideo = req.file.mimetype.startsWith('video/')
      const ext = isVideo ? 'mp4' : 'mp3'
      outputFilename = `converted-${Date.now()}.${ext}`
      outputPath = path.join(uploadDir, outputFilename)

      ffmpeg(inputPath)
        .toFormat(ext)
        .on('end', () => {
          fs.unlinkSync(inputPath)
          res.json({ 
            message: 'Media converted successfully', 
            url: `/uploads/${outputFilename}` 
          })
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err)
          if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
          res.status(500).json({ message: 'Error converting media' })
        })
        .save(outputPath)
    }
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ message: error.message })
  }
})

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message })
  }

  if (err) {
    return res.status(400).json({ message: err.message })
  }
})

connectDB()
  .then(async () => {
    await ensureDefaultAdmin()
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('Failed to start server due to DB error:', err.message)
    app.listen(PORT, () => console.log(`Server running on port ${PORT} without MongoDB`))
  })
