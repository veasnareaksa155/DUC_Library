const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const ORM = require('../googleSheetsORM');

const router = express.Router();

// Helper: Haversine distance formula
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  var R = 6371e3; // Radius of the earth in meters
  var dLat = deg2rad(lat2 - lat1);
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in meters
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// POST /verify - Check in at the library
router.post('/verify', authenticateToken, async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user.id;

    // Insert Checkin record
    const checkinRecord = {
      user_id: userId,
      checkin_time: new Date().toISOString(),
      lat: lat || null,
      lng: lng || null,
      status: 'success'
    };

    await ORM.insert('Checkins', checkinRecord);

    // Notify admins in real-time
    const sse = require('../services/sse');
    sse.broadcastToAdmins('new_checkin', {
      user_name: req.user.name || req.user.name_latin,
      checkin_time: checkinRecord.checkin_time
    });

    res.status(200).json({
      message: 'Successfully checked in to the library!',
      checkin_time: checkinRecord.checkin_time
    });

  } catch (error) {
    console.error('Checkin Error:', error);
    res.status(500).json({ message: 'Internal server error during checkin.' });
  }
});

// GET /my-today - See if the user checked in today
router.get('/my-today', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const checkins = await ORM.getAll('Checkins');
    
    // Filter for today's checkins by this user
    const todayStr = new Date().toISOString().split('T')[0];
    const myTodayCheckins = checkins.filter(c => 
      String(c.user_id) === String(userId) && 
      c.checkin_time.startsWith(todayStr) &&
      c.status === 'success'
    );

    res.json(myTodayCheckins);
  } catch (error) {
    console.error('Error fetching checkins:', error);
    res.status(500).json({ message: 'Failed to fetch checkin history.' });
  }
});

module.exports = router;
