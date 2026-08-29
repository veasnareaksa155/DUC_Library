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
const { generateSecret, verifySync } = require('otplib');
const QRCode = require('qrcode');

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
        
        const sse = require('../services/sse');
        sse.emitToUser(String(req.user.id), 'session_terminated', { session_id: session.id });
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

    // --- 2FA Check ---
    const user2fa = await ORM.find('User2FA', t => t.user_id === String(userDoc.id));
    if (user2fa.length > 0 && String(user2fa[0].is_enabled).toLowerCase() === 'true') {
      const tempToken = jwt.sign(
        { id: userDoc.id, role: userDoc.role, name: userDoc.name, email: userDoc.email, student_id: userDoc.student_id, profile_photo: finalPhoto, is_2fa_temp: true }, 
        JWT_SECRET, 
        { expiresIn: '5m' }
      );
      return res.json({ message: '2FA Required', require2FA: true, tempToken });
    }
    // -----------------

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
        if (geo.city && geo.country) {
          try {
            const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(geo.country);
            location = `${geo.city}, ${countryName}`;
          } catch (e) {
            location = `${geo.city}, ${geo.country}`;
          }
        } else if (geo.city) {
          location = geo.city;
        } else if (geo.country) {
          try {
            location = new Intl.DisplayNames(['en'], { type: 'region' }).of(geo.country);
          } catch (e) {
            location = geo.country;
          }
        } else {
          location = 'Unknown Location';
        }
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

    // Create a persistent notification for the security alert
    await ORM.insert('Notifications', {
      id: Date.now().toString(),
      user_id: userDoc.id,
      title: 'Security Alert: New Login',
      message: `A new login was detected on your account from ${deviceName} in ${location}. If this wasn't you, please secure your account immediately.`,
      type: 'warning',
      is_read: 'false',
      created_at: new Date().toISOString()
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

    // --- 2FA Check ---
    const user2fa = await ORM.find('User2FA', t => t.user_id === String(adminDoc.id));
    if (user2fa.length > 0 && String(user2fa[0].is_enabled).toLowerCase() === 'true') {
      const tempToken = jwt.sign(
        { id: adminDoc.id, role: adminDoc.role, name: adminDoc.name, email: adminDoc.email, profile_photo: adminDoc.profile_photo, is_2fa_temp: true }, 
        JWT_SECRET, 
        { expiresIn: '5m' }
      );
      return res.json({ message: '2FA Required', require2FA: true, tempToken });
    }
    // -----------------
    
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
        if (geo.city && geo.country) {
          try {
            const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(geo.country);
            location = `${geo.city}, ${countryName}`;
          } catch (e) {
            location = `${geo.city}, ${geo.country}`;
          }
        } else if (geo.city) {
          location = geo.city;
        } else if (geo.country) {
          try {
            location = new Intl.DisplayNames(['en'], { type: 'region' }).of(geo.country);
          } catch (e) {
            location = geo.country;
          }
        } else {
          location = 'Unknown Location';
        }
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

    // Create a persistent notification for the security alert
    await ORM.insert('Notifications', {
      id: Date.now().toString(),
      user_id: adminDoc.id,
      title: 'Security Alert: New Login',
      message: `A new login was detected on your account from ${deviceName} in ${location}. If this wasn't you, please secure your account immediately.`,
      type: 'warning',
      is_read: 'false',
      created_at: new Date().toISOString()
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

// ----------------------------------------------------
// 2FA Routes
// ----------------------------------------------------

router.get('/2fa/status', authenticateToken, async (req, res) => {
  try {
    const user2fa = await ORM.find('User2FA', t => t.user_id === String(req.user.id));
    if (user2fa.length > 0 && String(user2fa[0].is_enabled).toLowerCase() === 'true') {
      return res.json({ enabled: true });
    }
    res.json({ enabled: false });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check 2FA status' });
  }
});

router.post('/2fa/generate', authenticateToken, async (req, res) => {
  try {
    const secret = generateSecret();
    const accountName = encodeURIComponent(req.user.email || req.user.id);
    const issuer = encodeURIComponent('DUC Library');
    const otpauth = `otpauth://totp/${issuer}:${accountName}?secret=${secret}&issuer=${issuer}`;
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    
    // Check if exists
    const existing = await ORM.find('User2FA', t => t.user_id === String(req.user.id));
    if (existing.length > 0) {
      await ORM.update('User2FA', existing[0].id, { secret, is_enabled: 'false', updated_at: new Date().toISOString() });
    } else {
      await ORM.insert('User2FA', {
        id: crypto.randomUUID(),
        user_id: String(req.user.id),
        secret,
        is_enabled: 'false',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    res.json({ secret, qrCodeUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate 2FA secret' });
  }
});

router.post('/2fa/verify-setup', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const user2fa = await ORM.find('User2FA', t => t.user_id === String(req.user.id));
    
    if (user2fa.length === 0) return res.status(400).json({ error: '2FA not generated' });

    const { valid } = verifySync({ token, secret: user2fa[0].secret });
    if (!valid) return res.status(400).json({ error: 'Invalid 2FA code' });

    await ORM.update('User2FA', user2fa[0].id, { is_enabled: 'true', updated_at: new Date().toISOString() });
    
    const sse = require('../services/sse');
    sse.emitToUser(String(req.user.id), '2fa_status_changed', { enabled: true });
    
    res.json({ success: true, message: '2FA enabled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify 2FA' });
  }
});

router.post('/2fa/disable', authenticateToken, async (req, res) => {
  try {
    const user2fa = await ORM.find('User2FA', t => t.user_id === String(req.user.id));
    if (user2fa.length > 0) {
      await ORM.update('User2FA', user2fa[0].id, { is_enabled: 'false', updated_at: new Date().toISOString() });
      
      const sse = require('../services/sse');
      sse.emitToUser(String(req.user.id), '2fa_status_changed', { enabled: false });
    }
    res.json({ success: true, message: '2FA disabled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable 2FA' });
  }
});

router.post('/2fa/verify-login', async (req, res) => {
  try {
    const { tempToken, code, clientHintModel } = req.body;
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Invalid or expired temporary token' });
    }

    if (!decoded.is_2fa_temp) return res.status(400).json({ error: 'Invalid token type' });

    const user2fa = await ORM.find('User2FA', t => t.user_id === String(decoded.id));
    if (user2fa.length === 0 || String(user2fa[0].is_enabled).toLowerCase() !== 'true') {
      return res.status(400).json({ error: '2FA is not enabled for this user' });
    }

    const { valid } = verifySync({ token: code, secret: user2fa[0].secret });
    if (!valid) return res.status(400).json({ error: 'Invalid 2FA code' });

    // 2FA passed! Create session.
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
        if (geo.city && geo.country) {
          try {
            const countryName = new Intl.DisplayNames(['en'], { type: 'region' }).of(geo.country);
            location = `${geo.city}, ${countryName}`;
          } catch (e) {
            location = `${geo.city}, ${geo.country}`;
          }
        } else if (geo.city) {
          location = geo.city;
        } else if (geo.country) {
          try {
            location = new Intl.DisplayNames(['en'], { type: 'region' }).of(geo.country);
          } catch (e) {
            location = geo.country;
          }
        } else {
          location = 'Unknown Location';
        }
      }
    }
    
    await ORM.insert('UserSessions', {
      id: sessionId,
      user_id: decoded.id,
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

    sse.emitToUser(decoded.id, 'new_login_session', {
      session_id: sessionId,
      device_name: deviceName,
      location: location,
      ip: ip
    });

    // Create a persistent notification for the security alert
    await ORM.insert('Notifications', {
      id: Date.now().toString(),
      user_id: decoded.id,
      title: 'Security Alert: New Login (2FA Verified)',
      message: `A new login was detected on your account from ${deviceName} in ${location}.`,
      type: 'warning',
      is_read: 'false',
      created_at: new Date().toISOString()
    });

    const tokenPayload = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
      student_id: decoded.student_id,
      session_id: sessionId
    };
    
    const finalToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Login successful',
      token: finalToken,
      user: decoded
    });

  } catch (error) {
    console.error('2FA Verify Login Error:', error);
    res.status(500).json({ error: 'Failed to verify 2FA login' });
  }
});

module.exports = router;
