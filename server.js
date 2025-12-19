import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { encrypt, decrypt, hashValue, safeEncrypt, safeDecrypt } from './utils/crypto.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based authorization middleware
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Password hashing utilities
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// JWT token generation
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Database setup
let db;

async function initializeDatabase() {
  try {
    // Open SQLite database
    db = await open({
      filename: path.join(__dirname, 'database.sqlite'),
      driver: sqlite3.Database
    });

    console.log('Connected to SQLite database');

    // Create tables
    await createTables();

    // Initialize with demo data
    await initializeDemoData();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Create database tables
async function createTables() {
  // Locations table - NO DROP, just CREATE IF NOT EXISTS
  await db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT NOT NULL,
      district TEXT,
      area TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(state, district, area)
    )
  `);

  // Clinics table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS clinics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT,
      email TEXT,
      description TEXT,
      locationId INTEGER,
      deviceId TEXT,
      adminId TEXT,
      registrationDate TEXT,
      status TEXT DEFAULT 'active',
      facilities TEXT, -- JSON string
      operatingHours TEXT, -- JSON string
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (locationId) REFERENCES locations (id)
    )
  `);

  // Users table - FIXED to match actual database schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      dateOfBirth TEXT,
      address TEXT,
      deviceId TEXT,
      status TEXT DEFAULT 'active',
      clinicId TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Doctors table - FIXED to match actual database schema
  await db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      clinicId TEXT NOT NULL,
      name TEXT NOT NULL,
      specialization TEXT,
      experience TEXT,
      qualification TEXT,
      description TEXT,
      availableSlots TEXT DEFAULT '[]',
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (clinicId) REFERENCES clinics (id)
    )
  `);

  // Appointments table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      patientId TEXT NOT NULL,
      doctorId TEXT NOT NULL,
      clinicId TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      reason TEXT,
      notes TEXT,
      createdAt TEXT,
      FOREIGN KEY (patientId) REFERENCES users (id),
      FOREIGN KEY (doctorId) REFERENCES doctors (id),
      FOREIGN KEY (clinicId) REFERENCES clinics (id)
    )
  `);
}

// Initialize with demo data
async function initializeDemoData() {
  try {
    console.log('Initializing demo data...');

    // Check if data already exists
    const existingUsers = await db.get('SELECT COUNT(*) as count FROM users');
    if (existingUsers.count > 0) {
      console.log('Demo data already exists, skipping initialization');
      return;
    }

    // Hash passwords for security
    const adminPassword = await hashPassword('Admin@123');
    const doctorPassword = await hashPassword('Doctor@123');
    const patientPassword = await hashPassword('Patient@123');

    // Insert demo locations
    const locations = [
      { state: 'Tamil Nadu', district: 'Chennai', area: 'Tambaram' },
      { state: 'Tamil Nadu', district: 'Chennai', area: 'Anna Nagar' },
      { state: 'Tamil Nadu', district: 'Chennai', area: 'Velachery' },
      { state: 'Tamil Nadu', district: 'Coimbatore', area: 'Gandhipuram' },
      { state: 'Kerala', district: 'Kottayam', area: 'Erattupetta' },
      { state: 'Kerala', district: 'Kottayam', area: 'Vaikom' },
      { state: 'Delhi', district: 'Central Delhi', area: 'Connaught Place' },
      { state: 'Kerala', district: 'Kottayam', area: 'Pala' },
      { state: 'Tamil Nadu', district: 'Salem', area: 'Attur' }
    ];

    for (const location of locations) {
      await db.run(
        'INSERT INTO locations (state, district, area) VALUES (?, ?, ?)',
        [location.state, location.district, location.area]
      );
    }

    // Insert demo users with hashed passwords
    const users = [
      { id: '1', email: 'admin@hospital.com', password: adminPassword, role: 'admin', name: 'Admin User', phone: '+1234567890', deviceId: 'dvc_admin_device_001', status: 'active', clinicId: '1' },
      { id: '2', email: 'dr.smith@hospital.com', password: doctorPassword, role: 'doctor', name: 'Dr. John Smith', phone: '+1234567891', deviceId: 'dvc_doctor_device_002', status: 'active', clinicId: '1' },
      { id: '3', email: 'dr.johnson@hospital.com', password: doctorPassword, role: 'doctor', name: 'Dr. Sarah Johnson', phone: '+1234567892', deviceId: 'dvc_doctor_device_003', status: 'active', clinicId: '1' },
      { id: '4', email: 'patient1@email.com', password: patientPassword, role: 'patient', name: 'Alice Johnson', phone: '+1234567893', deviceId: 'dvc_patient_device_004', status: 'active' },
      { id: '5', email: 'patient2@email.com', password: patientPassword, role: 'patient', name: 'Bob Wilson', phone: '+1234567894', deviceId: 'dvc_patient_device_005', status: 'active' }
    ];

    for (const user of users) {
      await db.run(`
        INSERT INTO users (id, email, password, role, name, phone, deviceId, status, clinicId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [user.id, user.email, user.password, user.role, user.name, user.phone, user.deviceId, user.status, user.clinicId]);
    }

    // Insert demo clinics
    const clinics = [
      {
        name: 'Central Hospital',
        address: '123 Medical Center Dr, Healthcare City',
        phone: '+1234567890',
        email: 'info@centralhospital.com',
        locationId: 1,
        deviceId: 'dvc_admin_device_001',
        adminId: '1',
        registrationDate: '2025-01-01T00:00:00Z',
        status: 'active',
        facilities: ['Emergency', 'ICU', 'Surgery', 'Laboratory', 'Radiology'],
        operatingHours: { monday: '08:00-20:00', tuesday: '08:00-20:00', wednesday: '08:00-20:00', thursday: '08:00-20:00', friday: '08:00-20:00', saturday: '09:00-18:00', sunday: '10:00-16:00' },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-01T00:00:00Z'
      }
    ];

    for (const clinic of clinics) {
      await db.run(`
        INSERT INTO clinics (name, address, phone, email, locationId, deviceId, adminId, registrationDate, status, facilities, operatingHours, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clinic.name, clinic.address, clinic.phone, clinic.email, clinic.locationId,
        clinic.deviceId, clinic.adminId, clinic.registrationDate, clinic.status,
        JSON.stringify(clinic.facilities), JSON.stringify(clinic.operatingHours),
        clinic.createdAt, clinic.updatedAt
      ]);
    }

    // Insert demo doctors
    const doctors = [
      {
        userId: '2',
        clinicId: '1',
        name: 'Dr. John Smith',
        specialization: 'Cardiology',
        experience: '15 years',
        qualification: 'MD, FACC',
        description: 'Experienced cardiologist specializing in heart disease prevention and treatment.',
        availableSlots: [
          { day: 'monday', times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
          { day: 'tuesday', times: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
          { day: 'wednesday', times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] },
          { day: 'thursday', times: ['09:00', '10:00', '11:00', '14:00', '15:00'] },
          { day: 'friday', times: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'] }
        ]
      }
    ];

    for (const doctor of doctors) {
      await db.run(`
        INSERT INTO doctors (userId, clinicId, name, specialization, experience, qualification, description, availableSlots)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        doctor.userId, doctor.clinicId, doctor.name, doctor.specialization,
        doctor.experience, doctor.qualification, doctor.description,
        JSON.stringify(doctor.availableSlots)
      ]);
    }

    console.log('Demo data initialized successfully');
  } catch (error) {
    console.error('Demo data initialization error:', error);
  }
}

// API Routes

// Authentication Endpoints
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    // Find user by email
    const user = await db.get('SELECT * FROM users WHERE email = ? AND status = "active"', [email.toLowerCase()]);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = generateToken(user);
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Secure Users endpoint - only return limited data without sensitive info
app.get('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const users = await db.all('SELECT id, email, role, name, phone, status, created_at FROM users ORDER BY name');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/users', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const user = req.body;
    
    // Check for duplicate email (case insensitive)
    const existingEmail = await db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [user.email]);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already exists', field: 'email' });
    }
    
    // Check for duplicate phone
    if (user.phone) {
      const existingPhone = await db.get('SELECT id FROM users WHERE phone = ?', [user.phone]);
      if (existingPhone) {
        return res.status(409).json({ error: 'Phone number already exists', field: 'phone' });
      }
    }
    
    // Hash the password
    const hashedPassword = await hashPassword(user.password);
    
    const insertData = [
      user.id, user.email.toLowerCase(), hashedPassword, user.role, user.name,
      user.phone, user.dateOfBirth, user.address,
      user.deviceId, user.status || 'active', user.clinicId
    ];
    
    await db.run(`
      INSERT INTO users
      (id, email, password, role, name, phone, dateOfBirth, address, deviceId, status, clinicId)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, insertData);
    
    const newUser = await db.get('SELECT id, email, role, name, phone, status, created_at FROM users WHERE id = ?', [user.id]);
    res.json(newUser);
  } catch (error) {
    console.error('User creation error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Secure Doctors endpoint - encrypt sensitive data
app.get('/doctors', authenticateToken, async (req, res) => {
  try {
    const doctors = await db.all(`
      SELECT d.*, u.email, u.phone 
      FROM doctors d 
      LEFT JOIN users u ON d.userId = u.id 
      ORDER BY d.id
    `);
    
    // Parse JSON fields and encrypt sensitive data
    const parsedDoctors = doctors.map(doctor => ({
      ...doctor,
      user: {
        id: doctor.userId,
        email: safeDecrypt(doctor.email) || null,
        phone: safeDecrypt(doctor.phone) || null
      },
      description: safeDecrypt(doctor.description) || '',
      availableSlots: JSON.parse(doctor.availableSlots || '[]')
    }));
    res.json(parsedDoctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/doctors', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const doctor = req.body;
    
    const insertData = [
      doctor.userId, doctor.clinicId, doctor.name, doctor.specialization,
      doctor.experience, doctor.qualification, safeEncrypt(doctor.description || ''),
      JSON.stringify(doctor.availableSlots || [])
    ];
    
    const result = await db.run(`
      INSERT INTO doctors
      (userId, clinicId, name, specialization, experience, qualification, description, availableSlots)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, insertData);
    
    const newDoctor = await db.get('SELECT * FROM doctors WHERE id = ?', [result.lastID]);
    // Parse JSON fields for response
    newDoctor.availableSlots = JSON.parse(newDoctor.availableSlots || '[]');
    res.json(newDoctor);
  } catch (error) {
    console.error('Doctor creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Locations
app.get('/locations', async (req, res) => {
  try {
    const locations = await db.all('SELECT * FROM locations ORDER BY state, district, area');
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/locations', async (req, res) => {
  try {
    const { state, district, area } = req.body;
    const result = await db.run(
      'INSERT INTO locations (state, district, area) VALUES (?, ?, ?)',
      [state, district, area]
    );
    const location = await db.get('SELECT * FROM locations WHERE id = ?', [result.lastID]);
    res.json(location);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(409).json({ error: 'Location already exists' });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
});

// Clinics
app.get('/clinics', async (req, res) => {
  try {
    const clinics = await db.all('SELECT * FROM clinics ORDER BY name');
    // Parse JSON fields
    const parsedClinics = clinics.map(clinic => ({
      ...clinic,
      facilities: JSON.parse(clinic.facilities || '[]'),
      operatingHours: JSON.parse(clinic.operatingHours || '{}')
    }));
    res.json(parsedClinics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/clinics', async (req, res) => {
  try {
    const clinic = req.body;
    const result = await db.run(`
      INSERT INTO clinics
      (name, address, phone, email, description, locationId, deviceId, adminId, registrationDate, status, facilities, operatingHours, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clinic.name, clinic.address, clinic.phone, clinic.email, clinic.description,
      clinic.locationId, clinic.deviceId, clinic.adminId, clinic.registrationDate,
      clinic.status || 'active',
      JSON.stringify(clinic.facilities || []),
      JSON.stringify(clinic.operatingHours || {}),
      clinic.createdAt, clinic.updatedAt
    ]);
    const newClinic = await db.get('SELECT * FROM clinics WHERE id = ?', [result.lastID]);
    // Parse JSON fields for response
    newClinic.facilities = JSON.parse(newClinic.facilities || '[]');
    newClinic.operatingHours = JSON.parse(newClinic.operatingHours || '{}');
    res.json(newClinic);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Appointments - Secure endpoint
app.get('/appointments', authenticateToken, async (req, res) => {
  try {
    let query = 'SELECT * FROM appointments ORDER BY date DESC, time DESC';
    let params = [];
    
    // Role-based filtering
    if (req.user.role === 'doctor') {
      // Get doctor record for current user
      const doctor = await db.get('SELECT id FROM doctors WHERE userId = ?', [req.user.id]);
      if (doctor) {
        query = 'SELECT * FROM appointments WHERE doctorId = ? ORDER BY date DESC, time DESC';
        params = [doctor.id.toString()];
      } else {
        return res.json([]);
      }
    } else if (req.user.role === 'patient') {
      query = 'SELECT * FROM appointments WHERE patientId = ? ORDER BY date DESC, time DESC';
      params = [req.user.id];
    }
    // Admin can see all appointments (no additional filter)
    
    const appointments = await db.all(query, params);
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/appointments', authenticateToken, async (req, res) => {
  try {
    const appointment = req.body;
    
    // Verify user can create appointment for themselves (patients) or for their patients (doctors)
    if (req.user.role === 'patient' && appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Cannot create appointment for another patient' });
    }
    
    await db.run(`
      INSERT INTO appointments
      (id, patientId, doctorId, clinicId, date, time, status, reason, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      appointment.id, appointment.patientId, appointment.doctorId,
      appointment.clinicId, appointment.date, appointment.time,
      appointment.status || 'pending', appointment.reason, appointment.notes,
      appointment.createdAt
    ]);
    const newAppointment = await db.get('SELECT * FROM appointments WHERE id = ?', [appointment.id]);
    res.json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Appointments
app.get('/appointments', async (req, res) => {
  try {
    const appointments = await db.all('SELECT * FROM appointments ORDER BY date DESC, time DESC');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/appointments', async (req, res) => {
  try {
    const appointment = req.body;
    await db.run(`
      INSERT INTO appointments
      (id, patientId, doctorId, clinicId, date, time, status, reason, notes, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      appointment.id, appointment.patientId, appointment.doctorId,
      appointment.clinicId, appointment.date, appointment.time,
      appointment.status || 'pending', appointment.reason, appointment.notes,
      appointment.createdAt
    ]);
    const newAppointment = await db.get('SELECT * FROM appointments WHERE id = ?', [appointment.id]);
    res.json(newAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Secure PATCH routes with role-based authorization
app.patch('/users/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Handle password updates with hashing
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE users SET ${setClause} WHERE id = ?`;

    await db.run(query, [...values, id]);
    const updatedUser = await db.get('SELECT id, email, role, name, phone, status, created_at FROM users WHERE id = ?', [id]);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/doctors/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle availableSlots as JSON
    if (updates.availableSlots) {
      updates.availableSlots = JSON.stringify(updates.availableSlots);
    }
    
    // Encrypt sensitive fields
    if (updates.description) {
      updates.description = safeEncrypt(updates.description);
    }

    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE doctors SET ${setClause} WHERE id = ?`;

    await db.run(query, [...values, id]);
    const updatedDoctor = await db.get('SELECT * FROM doctors WHERE id = ?', [id]);

    if (!updatedDoctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Parse JSON fields for response
    updatedDoctor.availableSlots = JSON.parse(updatedDoctor.availableSlots || '[]');
    updatedDoctor.description = safeDecrypt(updatedDoctor.description) || '';
    res.json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates);
    const values = Object.values(updates);

    if (fields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Verify user can update this appointment
    const appointment = await db.get('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Authorization checks
    if (req.user.role === 'patient' && appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Cannot update another patient\'s appointment' });
    }
    if (req.user.role === 'doctor') {
      const doctor = await db.get('SELECT id FROM doctors WHERE userId = ?', [req.user.id]);
      if (doctor && appointment.doctorId !== doctor.id.toString()) {
        return res.status(403).json({ error: 'Cannot update another doctor\'s appointment' });
      }
    }
    // Admin can update any appointment

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE appointments SET ${setClause} WHERE id = ?`;

    await db.run(query, [...values, id]);
    const updatedAppointment = await db.get('SELECT * FROM appointments WHERE id = ?', [id]);

    if (!updatedAppointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Secure DELETE routes with role-based authorization
app.delete('/users/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/doctors/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM doctors WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify user can delete this appointment
    const appointment = await db.get('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Authorization checks
    if (req.user.role === 'patient' && appointment.patientId !== req.user.id) {
      return res.status(403).json({ error: 'Cannot delete another patient\'s appointment' });
    }
    if (req.user.role === 'doctor') {
      const doctor = await db.get('SELECT id FROM doctors WHERE userId = ?', [req.user.id]);
      if (doctor && appointment.doctorId !== doctor.id.toString()) {
        return res.status(403).json({ error: 'Cannot delete another doctor\'s appointment' });
      }
    }
    // Admin can delete any appointment
    
    await db.run('DELETE FROM appointments WHERE id = ?', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 SQLite database: ${path.join(__dirname, 'database.sqlite')}`);
    console.log(`📋 Available endpoints:`);
    console.log(`   GET  /locations`);
    console.log(`   POST /locations`);
    console.log(`   GET  /clinics`);
    console.log(`   POST /clinics`);
    console.log(`   GET  /users`);
    console.log(`   POST /users`);
    console.log(`   GET  /doctors`);
    console.log(`   POST /doctors`);
    console.log(`   GET  /appointments`);
    console.log(`   POST /appointments`);
  });
}

startServer().catch(console.error);
