# 🏥 Doctor Appointment System

A secure, full-stack healthcare appointment management system built with modern web technologies. The system enables patients to book appointments with doctors while providing comprehensive management tools for healthcare administrators.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (SQLite)      │
│   Port: 5173    │    │   Port: 5001    │    │   Encrypted     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    ┌─────────────────┐   ┌─────────────────┐ ┌─────────────────┐
│   JWT Auth      │    │   AES-256       │    │   Role-Based    │
│   Security      │    │   Encryption    │    │   Access        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Context API** - State management
- **CSS-in-JS** - Styled components

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **SQLite** - Embedded database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **crypto** - AES-256-GCM encryption

### Security Features
- **JWT Authentication** - Secure token-based auth
- **bcrypt Hashing** - 12-round password hashing
- **AES-256-GCM** - PII encryption at rest
- **Role-Based Access** - Admin, Doctor, Patient roles
- **Input Validation** - SQL injection prevention
- **CORS Protection** - Cross-origin security

## 🔐 Security Implementation

### Authentication Flow
1. **Login**: User provides email/password
2. **Validation**: bcrypt verifies hashed password
3. **JWT Generation**: Secure token with user claims
4. **Token Storage**: Client-side secure storage
5. **API Protection**: All endpoints require valid JWT

### Data Protection
- **Passwords**: Never stored in plain text, only bcrypt hashes
- **PII Fields**: Email, phone, addresses encrypted with AES-256-GCM
- **Database**: SQLite with encrypted sensitive fields
- **API Responses**: Filtered to exclude sensitive data

### Role-Based Access Control
- **Admin**: Full system access, user management
- **Doctor**: Own appointments, patient management
- **Patient**: Own appointments, doctor search/booking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and setup**
   ```bash
   git clone https://github.com/sarathi-eng/Doctor-Appointment-System
   cd doctor-appointment-system
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your secure keys
   ```

3. **Generate Secure Keys**
   ```bash
   # Generate AES key
   openssl rand -hex 32
   
   # Generate JWT secret
   openssl rand -base64 32
   ```

4. **Start Development Servers**
   ```bash
   # Terminal 1: Backend
   PORT=5001 npm run server
   
   # Terminal 2: Frontend  
   npm run dev
   ```

5. **Access Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5002

### Production Deployment

1. **Build Frontend**
   ```bash
   npm run build
   ```

2. **Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   JWT_SECRET=<secure-random-string>
   AES_SECRET_KEY=<32-byte-hex-key>
   ```

3. **Start Production Server**
   ```bash
   npm start
   ```

## 👥 User Roles & Authentication

### Demo Accounts
The system comes with pre-configured demo accounts:

| Role | Email | Password | Description |
|------|-------|----------|-------------|
| Admin | admin@hospital.com | Admin@123 | Full system access |
| Doctor | dr.smith@hospital.com | Doctor@123 | Dr. John Smith - Cardiology |
| Doctor | dr.johnson@hospital.com | Doctor@123 | Dr. Sarah Johnson - Pediatrics |
| Patient | patient1@email.com | Patient@123 | Alice Johnson |
| Patient | patient2@email.com | Patient@123 | Bob Wilson |

### Authentication API
```javascript
POST /auth/login
{
  "email": "user@example.com",
  "password": "securePassword"
}

// Response
{
  "token": "jwt_token_here",
  "user": {
    "id": "1",
    "email": "user@example.com", 
    "role": "admin",
    "name": "User Name"
  }
}
```

## 🔄 User Flows

### Patient Flow
1. **Location Selection** → Choose state/district/area
2. **Clinic Browse** → View available clinics
3. **Doctor Search** → Filter by specialization
4. **Time Slot Booking** → Select available appointment
5. **Confirmation** → Receive booking confirmation
6. **Appointment Management** → View, modify, or cancel

### Doctor Flow  
1. **Dashboard Overview** → View today's appointments
2. **Schedule Management** → Set availability
3. **Appointment Handling** → Confirm, complete, or cancel
4. **Patient Records** → Access appointment history

### Admin Flow
1. **System Dashboard** → Overview statistics
2. **User Management** → Add/edit patients and doctors
3. **Clinic Management** → Register and configure clinics
4. **Appointment Oversight** → Monitor all system appointments

## 📊 API Endpoints

### Authentication
- `POST /auth/login` - User authentication
- `GET /auth/profile` - Get current user profile

### Public Endpoints
- `GET /locations` - Get all locations
- `GET /clinics` - Get all clinics

### Protected Endpoints (Require JWT)
- `GET /users` - Admin: Get all users
- `POST /users` - Admin: Create new user
- `GET /doctors` - Get all doctors
- `POST /doctors` - Admin: Create doctor
- `GET /appointments` - Get user's appointments
- `POST /appointments` - Create new appointment
- `PATCH /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Cancel appointment

## 🗃️ Database Schema

### Core Tables
- **users** - User accounts with encrypted PII
- **doctors** - Doctor profiles with availability
- **clinics** - Healthcare facility information  
- **locations** - Geographic location hierarchy
- **appointments** - Booking records with status

### Security Features
- **Encrypted Fields**: Email, phone, addresses
- **Hashed Passwords**: bcrypt with 12 rounds
- **Role Constraints**: SQL foreign key relationships
- **Data Validation**: NOT NULL and UNIQUE constraints

## 🛡️ Security Checklist

- ✅ **Password Security**: bcrypt hashing (12 rounds)
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **PII Encryption**: AES-256-GCM for sensitive data
- ✅ **Role-Based Access**: Admin/Doctor/Patient roles
- ✅ **SQL Injection Prevention**: Parameterized queries
- ✅ **CORS Configuration**: Controlled cross-origin access
- ✅ **Environment Variables**: Secure configuration management
- ✅ **No Plain Text Secrets**: All sensitive data encrypted

## 📱 Features

### Patient Features
- Location-based clinic discovery
- Doctor search by specialization
- Real-time appointment booking
- Appointment history and management
- Cancellation with reason tracking

### Doctor Features  
- Personal dashboard with today's schedule
- Appointment status management
- Patient information access
- Schedule availability configuration

### Admin Features
- Complete system overview and statistics
- User management (patients/doctors)
- Clinic registration and management
- System-wide appointment monitoring

## 🔧 Configuration

### Environment Variables
```env
# Required for production
AES_SECRET_KEY=32_byte_hex_key_here
JWT_SECRET=secure_random_string_here
NODE_ENV=production
PORT=5000
```

### Database Configuration
- **Development**: `./database.sqlite`
- **Production**: Configurable via DATABASE_PATH
- **Backup**: Regular SQLite database backups recommended

## 📈 Performance

- **Frontend**: Vite optimization, code splitting
- **Backend**: Efficient SQLite queries, connection pooling
- **Database**: Indexed foreign keys, optimized queries
- **Security**: Minimal data exposure, role-based filtering
