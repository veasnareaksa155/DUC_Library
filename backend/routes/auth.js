const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { get, run, all } = require('../db');
const { JWT_SECRET, authenticateToken } = require('../middleware/auth');
const { syncStudentsToDb, SAMPLE_STUDENTS, getServiceAccountEmail } = require('../googleSheets');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email address is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'user']
    );

    const user = { id: result.id, name, email, role: 'user' };
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

// Login user or admin (Supports Email, Student ID, or Name from Google Sheet)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Username / Student ID / Email and password are required.' });
    }

    const identifier = email.trim();

    // Query user by Email, Name, or Student ID prefix
    let user = await get(`
      SELECT * FROM users 
      WHERE email = ? OR LOWER(name) = LOWER(?) OR email LIKE ?
    `, [identifier, identifier, `${identifier.toLowerCase()}@duc.com`]);

    // If user not found yet, check sample student data or sync from sheet
    if (!user) {
      const matchSample = SAMPLE_STUDENTS.find(s => 
        s.studentId.toLowerCase() === identifier.toLowerCase() ||
        s.latinName.toLowerCase() === identifier.toLowerCase() ||
        s.khmerName === identifier
      );

      if (matchSample) {
        // Auto-create student user account
        const userEmail = `${matchSample.studentId.toLowerCase()}@duc.com`;
        const hashedPassword = await bcrypt.hash(matchSample.studentId, 10);
        const resInsert = await run(
          'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
          [matchSample.latinName, userEmail, hashedPassword, 'user']
        );
        user = await get('SELECT * FROM users WHERE id = ?', [resInsert.id]);
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid username, Student ID, or password.' });
    }

    // Compare password (also allow Student ID as default password)
    let validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword && user.email.includes('@duc.com')) {
      const studentIdFromEmail = user.email.split('@')[0].toUpperCase();
      if (password === studentIdFromEmail || password === user.name) {
        validPassword = true;
      }
    }

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password. (Note: Student ID is your default password).' });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      student_id: user.student_id
    };
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      student_id: user.student_id,
      dorm_room: user.dorm_room,
      name_khmer: user.name_khmer,
      name_latin: user.name_latin,
      gender: user.gender,
      date_of_birth: user.date_of_birth,
      profile_photo: user.profile_photo,
      high_school: user.high_school,
      province: user.province,
      exam_year: user.exam_year,
      grade: user.grade,
      major: user.major,
      degree_level: user.degree_level,
      class_code: user.class_code,
      academic_status: user.academic_status,
      generation: user.generation,
      academic_year: user.academic_year,
      phone: user.phone,
      telegram: user.telegram,
      guardian_phone: user.guardian_phone
    };

    res.json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// Trigger Google Sheet Students Sync (Admin or System)
router.post('/sync-sheet', async (req, res) => {
  try {
    const { spreadsheet_id } = req.body;
    const result = await syncStudentsToDb(spreadsheet_id);
    res.json({
      message: `Successfully synced ${result.students.length} student records from Google Sheet!`,
      details: result,
      service_account_email: getServiceAccountEmail()
    });
  } catch (error) {
    console.error('Google Sheet sync error:', error);
    res.status(500).json({ message: 'Failed to sync Google Sheet data.' });
  }
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
    const user = await get(`
      SELECT id, name, email, role, created_at, student_id, dorm_room, name_khmer, name_latin, gender,
             date_of_birth, profile_photo, high_school, province, exam_year, grade, major,
             degree_level, class_code, academic_status, generation, academic_year, phone, telegram, guardian_phone
      FROM users WHERE id = ?
    `, [req.user.id]);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user profile.' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const {
      name, name_khmer, name_latin, student_id, dorm_room, gender, date_of_birth,
      high_school, province, exam_year, grade, major, degree_level, class_code,
      academic_status, generation, academic_year, phone, telegram, guardian_phone
    } = req.body;

    await run(`
      UPDATE users SET 
        name = COALESCE(?, name),
        name_khmer = ?, name_latin = ?, student_id = ?, dorm_room = ?, gender = ?,
        date_of_birth = ?, high_school = ?, province = ?, exam_year = ?, grade = ?,
        major = ?, degree_level = ?, class_code = ?, academic_status = ?, generation = ?,
        academic_year = ?, phone = ?, telegram = ?, guardian_phone = ?
      WHERE id = ?
    `, [
      name || null, name_khmer || null, name_latin || null, student_id || null, dorm_room || null, gender || null,
      date_of_birth || null, high_school || null, province || null, exam_year || null, grade || null,
      major || null, degree_level || null, class_code || null, academic_status || null, generation || null,
      academic_year || null, phone || null, telegram || null, guardian_phone || null,
      req.user.id
    ]);

    const updatedUser = await get(`
      SELECT id, name, email, role, created_at, student_id, dorm_room, name_khmer, name_latin, gender,
             date_of_birth, profile_photo, high_school, province, exam_year, grade, major,
             degree_level, class_code, academic_status, generation, academic_year, phone, telegram, guardian_phone
      FROM users WHERE id = ?
    `, [req.user.id]);

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

    await run('UPDATE users SET profile_photo = ? WHERE id = ?', [profile_photo, req.user.id]);

    const updatedUser = await get(`
      SELECT id, name, email, role, created_at, student_id, dorm_room, name_khmer, name_latin, gender,
             date_of_birth, profile_photo, high_school, province, exam_year, grade, major,
             degree_level, class_code, academic_status, generation, academic_year, phone, telegram, guardian_phone
      FROM users WHERE id = ?
    `, [req.user.id]);

    res.json({ message: 'Profile photo updated successfully!', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile photo:', error);
    res.status(500).json({ message: 'Failed to update profile photo.' });
  }
});

module.exports = router;
