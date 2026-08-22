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

    if (!lat || !lng) {
      return res.status(400).json({ message: 'GPS Coordinates (latitude and longitude) are required.' });
    }

    // Check if user already checked in today
    const checkins = await ORM.getAll('Checkins');
    const todayStr = new Date().toISOString().split('T')[0];
    const alreadyCheckedIn = checkins.some(c => 
      String(c.user_id) === String(userId) && 
      c.checkin_time.startsWith(todayStr)
    );

    if (alreadyCheckedIn) {
      return res.status(400).json({ message: 'You have already checked in today!' });
    }

    // Default to a placeholder if not set in .env (You should set these in backend/.env)
    const libraryLat = parseFloat(process.env.LIBRARY_LAT || '11.5564'); 
    const libraryLng = parseFloat(process.env.LIBRARY_LNG || '104.9282');
    const allowedRadiusMeters = parseInt(process.env.LIBRARY_RADIUS_METERS || '100'); // default 100 meters

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    const distance = getDistanceFromLatLonInM(libraryLat, libraryLng, userLat, userLng);

    if (distance > allowedRadiusMeters) {
      return res.status(403).json({ 
        message: `You are too far from the library! (You are ${Math.round(distance)} meters away. Must be within ${allowedRadiusMeters}m).`,
        distance_meters: Math.round(distance),
        allowed_radius: allowedRadiusMeters
      });
    }

    // Insert Checkin record
    const checkinRecord = {
      user_id: userId,
      checkin_time: new Date().toISOString(),
      lat: userLat,
      lng: userLng,
      status: 'success'
    };

    await ORM.insert('Checkins', checkinRecord);

    res.status(200).json({
      message: 'Successfully checked in to the library!',
      distance_meters: Math.round(distance),
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
      c.checkin_time.startsWith(todayStr)
    );

    res.json(myTodayCheckins);
  } catch (error) {
    console.error('Error fetching checkins:', error);
    res.status(500).json({ message: 'Failed to fetch checkin history.' });
  }
});

module.exports = router;
