const webPush = require('web-push');
const { find, remove } = require('../googleSheetsORM');

// Configure web-push with VAPID keys
webPush.setVapidDetails(
  'mailto:admin@duclibrary.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Sends a push notification to all devices registered for a user.
 * @param {string} userId - The user ID to send the notification to.
 * @param {object} payload - The notification payload (e.g., { title, message, url }).
 */
async function sendPushNotification(userId, payload) {
  try {
    // Get all subscriptions for this user
    const subscriptions = await find('PushSubscriptions', s => String(s.user_id) === String(userId));

    if (!subscriptions || subscriptions.length === 0) {
      return; // No subscriptions found
    }

    const payloadString = JSON.stringify(payload);

    // Send to all subscriptions in parallel
    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth
        }
      };

      try {
        await webPush.sendNotification(pushSubscription, payloadString);
      } catch (err) {
        // If the subscription is no longer valid (e.g., user revoked permission), remove it
        if (err.statusCode === 404 || err.statusCode === 410) {
          console.log(`Push subscription ${sub.id} expired or invalid. Removing...`);
          await remove('PushSubscriptions', sub.id);
        } else {
          console.error(`Error sending push notification to subscription ${sub.id}:`, err);
        }
      }
    });

    await Promise.allSettled(sendPromises);
  } catch (error) {
    console.error('Failed to send push notification:', error);
  }
}

module.exports = {
  sendPushNotification
};
