const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { getServiceAccountEmail } = require('../googleSheets');
const ORM = require('../googleSheetsORM');

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

// Login user or admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Username / Student ID / Email and password are required.' });
    }

    const identifier = email.trim().toLowerCase();
    
    // Find user by email, student_id, or name
    const users = await ORM.getAll('Users');
    
    let userDoc = users.find(u => 
      (u.email && u.email.toLowerCase() === identifier) ||
      (u.email && u.email.toLowerCase() === `${identifier}@duc.com`) ||
      (u.student_id && u.student_id.toLowerCase() === identifier) ||
      (u.name && u.name.toLowerCase() === identifier)
    );

    const { fetchStudentsFromSheet } = require('../googleSheets');
    const LIVE_STUDENTS = await fetchStudentsFromSheet(process.env.GOOGLE_SHEET_ID || '1YWZoN8THhaxO7H734gRxa7ahGsJoNHWcvyeR-QSa3LU') || [];

    // Auto-create sample student if not found
    if (!userDoc) {
      const matchSample = LIVE_STUDENTS.find(s => 
        s.studentId.toLowerCase() === identifier.toLowerCase() ||
        s.latinName.toLowerCase() === identifier.toLowerCase() ||
        s.khmerName === identifier
      );

      if (matchSample) {
        const userEmail = `${matchSample.studentId.toLowerCase()}@duc.com`;
        const hashedPassword = await bcrypt.hash(matchSample.studentId, 10);
        
        const newUser = {
          name: matchSample.latinName,
          email: userEmail,
          password: hashedPassword,
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
          created_at: new Date().toISOString()
        };

        const inserted = await ORM.insert('Users', newUser);
        userDoc = inserted;
      }
    } else {
      // Backfill missing fields from Live Master Student List for existing Firebase-migrated users
      if (!userDoc.dob || !userDoc.pob || !userDoc.bac2_grade) {
        const matchSample = LIVE_STUDENTS.find(s => s.studentId && userDoc.student_id && s.studentId.toLowerCase() === userDoc.student_id.toLowerCase());
        if (matchSample) {
          userDoc.gender = matchSample.gender || userDoc.gender || '';
          userDoc.dob = matchSample.dateOfBirth || userDoc.dob || '';
          userDoc.pob = matchSample.province || userDoc.pob || '';
          userDoc.high_school = matchSample.highSchool || userDoc.high_school || '';
          userDoc.telegram = matchSample.telegram || userDoc.telegram || '';
          userDoc.guardian_phone = matchSample.guardianPhone || userDoc.guardian_phone || '';
          userDoc.major = matchSample.major || userDoc.major || '';
          userDoc.degree_level = matchSample.degreeLevel || userDoc.degree_level || '';
          userDoc.class_code = matchSample.classCode || userDoc.class_code || '';
          userDoc.status = matchSample.academicStatus || userDoc.status || 'Active Student';
          userDoc.academic_year = matchSample.academicYear || userDoc.academic_year || '';
          userDoc.generation = matchSample.generation || userDoc.generation || '';
          userDoc.bac2_grade = matchSample.grade || userDoc.bac2_grade || '';
          userDoc.phone = matchSample.phone || userDoc.phone || '';
          
          await ORM.update('Users', userDoc.id, userDoc);
        }
      }
    }

    if (!userDoc) {
      return res.status(401).json({ message: 'Invalid username, Student ID, or password.' });
    }

    let validPassword = false;
    if (userDoc.password) {
      validPassword = await bcrypt.compare(password, userDoc.password);
    }
    
    if (!validPassword && userDoc.email && userDoc.email.includes('@duc.com')) {
      const studentIdFromEmail = userDoc.email.split('@')[0].toUpperCase();
      if (password === studentIdFromEmail || password === userDoc.name) {
        validPassword = true;
      }
    }

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password. (Note: Student ID is your default password).' });
    }

    const tokenPayload = {
      id: userDoc.id,
      email: userDoc.email,
      role: userDoc.role || 'user',
      name: userDoc.name,
      student_id: userDoc.student_id
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    // Hide password before returning
    delete userDoc.password;

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

    await ORM.update('Users', req.user.id, { profile_photo });
    const updatedUser = await ORM.getById('Users', req.user.id);
    delete updatedUser.password;

    res.json({ message: 'Profile photo updated successfully!', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ message: 'Failed to update profile photo.' });
  }
});

module.exports = router;
