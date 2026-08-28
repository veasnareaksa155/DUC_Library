const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { getServiceAccountEmail } = require('../googleSheets');
const ORM = require('../googleSheetsORM');
const cloudinary = require('cloudinary').v2;
const crypto = require('crypto');
const UAParser = require('ua-parser-js');
const geoip = require('geoip-lite');
const sse = require('../services/sse');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUsers = await ORM.find('Users', u => u.email === email);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role: 'user',
      created_at: new Date().toISOString()
    };

    const inserted = await ORM.insert('Users', newUser);

    const user = { id: inserted.id, name, email, role: 'user' };
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// Logout current session
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const sessionId = req.user.session_id;
    if (sessionId) {
      const allSessions = await ORM.getAll('UserSessions') || [];
      const session = allSessions.find(s => s.id === sessionId);
      if (session) {
        session.status = 'terminated';
        await ORM.update('UserSessions', session.id, session);
      }
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Login user or admin
router.post('/login', async (req, res) => {
  try {
    const { email, password, deviceModel: clientHintModel } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Username / Student ID / Email and password are required.' });
    }

    const identifier = email.trim().toLowerCase();

    // 1. Fetch live students from Google Sheet
    const { fetchStudentsFromSheet } = require('../googleSheets');
    const LIVE_STUDENTS = await fetchStudentsFromSheet(process.env.SPREADSHEET_ID || '1YWZoN8THhaxO7H734gRxa7ahGsJoNHWcvyeR-QSa3LU') || [];

    // 3. Find student in the live list
    const matchSample = LIVE_STUDENTS.find(s => 
      (s.studentId && s.studentId.toLowerCase() === identifier) ||
      (s.latinName && s.latinName.toLowerCase() === identifier) ||
      (s.khmerName && s.khmerName === identifier) ||
      (s.studentId && `${s.studentId.toLowerCase()}@duc.com` === identifier)
    );

    if (!matchSample) {
      return res.status(401).json({ message: 'Invalid username or Student ID. Not found in Student List.' });
    }

    // 4. Verify password (default to Student ID)
    if (password.toLowerCase() !== matchSample.studentId.toLowerCase() && password !== matchSample.latinName) {
      return res.status(401).json({ message: 'Invalid password. (Note: Student ID is your default password).' });
    }

    // 4.5 Check local ProfilePhotos table for overrides
    const localPhotos = await ORM.find('ProfilePhotos', p => p.student_id === matchSample.studentId);
    let finalPhoto = matchSample.profilePhoto || '';
    if (localPhotos.length > 0 && localPhotos[0].photo_url) {
      finalPhoto = localPhotos[0].photo_url;
    }

    // 5. Construct virtual user document
    const userDoc = {
      id: matchSample.studentId, // Internal ID is Student ID
      name: matchSample.latinName,
      email: `${matchSample.studentId.toLowerCase()}@duc.com`,
      role: 'user',
      student_id: matchSample.studentId,
      name_khmer: matchSample.khmerName,
      gender: matchSample.gender || '',
      dob: matchSample.dateOfBirth || '',
      pob: matchSample.province || '',
      high_school: matchSample.highSchool || '',
      telegram: matchSample.telegram || '',
      guardian_phone: matchSample.guardianPhone || '',
      major: matchSample.major || '',
      degree_level: matchSample.degreeLevel || '',
      class_code: matchSample.classCode || '',
      status: matchSample.academicStatus || 'Active Student',
      academic_year: matchSample.academicYear || '',
      generation: matchSample.generation || '',
      bac2_grade: matchSample.grade || '',
      phone: matchSample.phone || '',
      profile_photo: finalPhoto,
      created_at: new Date().toISOString()
    };

    // Create session
    const sessionId = crypto.randomUUID();
    const parser = new UAParser(req.headers['user-agent']);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();
    const deviceType = device.type || (os.name === 'iOS' || os.name === 'Android' ? 'mobile' : 'desktop');
    
    let deviceName = 'Unknown Device';
    if (clientHintModel) {
      deviceName = device.vendor ? `${device.vendor} ${clientHintModel}` : clientHintModel;
    } else if (device.vendor && device.model && device.model !== 'K') {
      deviceName = `${device.vendor} ${device.model}`;
    } else if (device.vendor) {
      deviceName = device.vendor;
    } else if (device.model && device.model !== 'K') {
      deviceName = device.model;
    } else if (deviceType === 'desktop') {
      deviceName = 'Desktop Computer';
    } else if (deviceType === 'mobile') {
      deviceName = 'Mobile Device';
    }

    let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown IP';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    
    let location = 'Unknown Location';
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = 'Localhost (::1)';
      location = 'Local Network';
    } else {
      const geo = geoip.lookup(ip);
      if (geo) {
        location = `${geo.city || 'Unknown City'}, ${geo.country || ''}`.trim();
        if (location === ',') location = 'Unknown Location';
      }
    }
    
    await ORM.insert('UserSessions', {
      id: sessionId,
      user_id: userDoc.id,
      device_type: deviceType,
      os: os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unknown OS',
      browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown Browser',
      ip_address: ip,
      status: 'active',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      device_name: deviceName,
      location: location
    });

    // Broadcast new login to the user's other active sessions
    sse.emitToUser(userDoc.id, 'new_login_session', {
      session_id: sessionId,
      device_name: deviceName,
      location: location,
      ip: ip
    });

    const tokenPayload = {
      id: userDoc.id,
      email: userDoc.email,
      role: userDoc.role,
      name: userDoc.name,
      student_id: userDoc.student_id,
      session_id: sessionId
    };
    
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token,
      user: userDoc
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// Admin Login Route
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password, deviceModel: clientHintModel } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const identifier = email.trim().toLowerCase();
    
    // Check Admins sheet
    const admins = await ORM.getAll('Admins');
    const adminMatch = admins.find(a => 
      ((a.username || '').toLowerCase() === identifier || (a.email || '').toLowerCase() === identifier) && 
      a.password === password
    );
    
    if (!adminMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }
    
    const adminDoc = {
      id: adminMatch.id,
      email: adminMatch.email,
      role: 'admin',
      name: adminMatch.name,
      profile_photo: adminMatch.profile_photo || ''
    };
    
    // Create session for admin
    const sessionId = crypto.randomUUID();
    const parser = new UAParser(req.headers['user-agent']);
    const browser = parser.getBrowser();
    const os = parser.getOS();
    const device = parser.getDevice();
    const deviceType = device.type || (os.name === 'iOS' || os.name === 'Android' ? 'mobile' : 'desktop');
    
    let deviceName = 'Unknown Device';
    if (clientHintModel) {
      deviceName = device.vendor ? `${device.vendor} ${clientHintModel}` : clientHintModel;
    } else if (device.vendor && device.model && device.model !== 'K') {
      deviceName = `${device.vendor} ${device.model}`;
    } else if (device.vendor) {
      deviceName = device.vendor;
    } else if (device.model && device.model !== 'K') {
      deviceName = device.model;
    } else if (deviceType === 'desktop') {
      deviceName = 'Desktop Computer';
    } else if (deviceType === 'mobile') {
      deviceName = 'Mobile Device';
    }

    let ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'Unknown IP';
    if (ip.includes(',')) ip = ip.split(',')[0].trim();
    
    let location = 'Unknown Location';
    if (ip === '::1' || ip === '127.0.0.1') {
      ip = 'Localhost (::1)';
      location = 'Local Network';
    } else {
      const geo = geoip.lookup(ip);
      if (geo) {
        location = `${geo.city || 'Unknown City'}, ${geo.country || ''}`.trim();
        if (location === ',') location = 'Unknown Location';
      }
    }
    
    await ORM.insert('UserSessions', {
      id: sessionId,
      user_id: adminDoc.id,
      device_type: deviceType,
      os: os.name ? `${os.name} ${os.version || ''}`.trim() : 'Unknown OS',
      browser: browser.name ? `${browser.name} ${browser.version || ''}`.trim() : 'Unknown Browser',
      ip_address: ip,
      status: 'active',
      created_at: new Date().toISOString(),
      last_active: new Date().toISOString(),
      device_name: deviceName,
      location: location
    });

    // Broadcast new login to the admin's other active sessions
    sse.emitToUser(adminDoc.id, 'new_login_session', {
      session_id: sessionId,
      device_name: deviceName,
      location: location,
      ip: ip
    });

    adminDoc.session_id = sessionId;
    
    const token = jwt.sign(adminDoc, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ message: 'Admin login successful', token, user: adminDoc });
    
  } catch (error) {
    console.error('Admin Login error:', error);
    res.status(500).json({ message: 'Internal server error during admin login.' });
  }
});

// Get active sessions for current user
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const allSessions = await ORM.getAll('UserSessions') || [];
    const userSessions = allSessions.filter(s => 
      String(s.user_id) === String(req.user.id) && s.status === 'active'
    );
    // Sort by most recent
    userSessions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    res.json(userSessions);
  } catch (err) {
    console.error('Failed to get sessions:', err);
    res.status(500).json({ message: 'Failed to fetch active sessions' });
  }
});

// Terminate a specific session
router.delete('/sessions/:id', authenticateToken, async (req, res) => {
  try {
    const allSessions = await ORM.getAll('UserSessions') || [];
    const session = allSessions.find(s => s.id === req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (String(session.user_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to terminate this session' });
    }
    
    session.status = 'terminated';
    await ORM.update('UserSessions', session.id, session);
    
    // Broadcast real-time termination to that specific user
    sse.emitToUser(session.user_id, 'session_terminated', { session_id: session.id });
    
    res.json({ message: 'Session terminated successfully' });
  } catch (err) {
    console.error('Failed to terminate session:', err);
    res.status(500).json({ message: 'Failed to terminate session' });
  }
});

// Trigger Google Sheet Students Sync (Admin or System)
router.post('/sync-sheet', async (req, res) => {
  // Sync is no longer needed since Google Sheets is the DB
  res.json({
    message: `Sync is no longer needed. The database is already Google Sheets!`,
    details: { synced: true },
    service_account_email: getServiceAccountEmail()
  });
});

// Get Service Account Email info
router.get('/service-account', (req, res) => {
  const email = getServiceAccountEmail();
  res.json({
    service_account_email: email,
    has_credentials: !!email
  });
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await ORM.getById('Users', req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    delete user.password;
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updateData = {};
    const fields = [
      'name', 'name_khmer', 'name_latin', 'student_id', 'dorm_room', 'gender', 'date_of_birth',
      'high_school', 'province', 'exam_year', 'grade', 'major', 'degree_level', 'class_code',
      'academic_status', 'generation', 'academic_year', 'phone', 'telegram', 'guardian_phone'
    ];

    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    if (Object.keys(updateData).length > 0) {
      await ORM.update('Users', req.user.id, updateData);
    }

    const updatedUser = await ORM.getById('Users', req.user.id);
    delete updatedUser.password;
    res.json({ message: 'Profile updated successfully!', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Failed to update user profile.' });
  }
});

// Update user profile photo only
router.put('/profile-photo', authenticateToken, async (req, res) => {
  try {
    const { profile_photo } = req.body;
    if (!profile_photo) {
      return res.status(400).json({ message: 'Profile photo is required.' });
    }

    // 1. Upload base64 image to Cloudinary
    const uploadRes = await cloudinary.uploader.upload(profile_photo, {
      folder: 'duc_library/profiles',
      public_id: req.user.id || 'admin',
      overwrite: true
    });
    const photoUrl = uploadRes.secure_url;

    // 2. Save/Update Cloudinary URL
    let updatedUser = { id: req.user.id, profile_photo: photoUrl };
    
    if (req.user.role === 'admin') {
      await ORM.update('Admins', req.user.id, { profile_photo: photoUrl });
      updatedUser = await ORM.getById('Admins', req.user.id);
      delete updatedUser.password;
    } else {
      // For students, save to ProfilePhotos sheet
      const existingPhotos = await ORM.find('ProfilePhotos', p => p.student_id === req.user.id);
      if (existingPhotos.length > 0) {
        await ORM.update('ProfilePhotos', existingPhotos[0].id, { photo_url: photoUrl, updated_at: new Date().toISOString() });
      } else {
        await ORM.insert('ProfilePhotos', {
          student_id: req.user.id,
          photo_url: photoUrl,
          updated_at: new Date().toISOString()
        });
      }
    }

    res.json({ message: 'Profile photo updated successfully!', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ message: 'Failed to update profile photo.', error: error.message });
  }
});

module.exports = router;
