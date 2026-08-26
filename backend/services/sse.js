/**
 * Server-Sent Events (SSE) Manager
 */

// Store connected clients
// Key: user_id, Value: Set of response objects (one user might have multiple tabs open)
const clients = new Map();

function addClient(userId, res, userObj = null) {
  if (!clients.has(userId)) {
    clients.set(userId, new Set());
  }
  
  if (userObj) {
    res.user = userObj;
  }
  
  clients.get(userId).add(res);

  // Send initial connection success message
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'SSE Connection Established' })}\n\n`);

  // Remove client when connection closes
  res.on('close', () => {
    removeClient(userId, res);
  });
}

function removeClient(userId, res) {
  if (clients.has(userId)) {
    const userClients = clients.get(userId);
    userClients.delete(res);
    if (userClients.size === 0) {
      clients.delete(userId);
    }
  }
}

/**
 * Emit an event to a specific user
 * @param {string} userId The user to notify
 * @param {string} eventType The type of event (e.g., 'borrowing_updated')
 * @param {object} payload The data to send
 */
function emitToUser(userId, eventType, payload) {
  if (clients.has(userId)) {
    const userClients = clients.get(userId);
    const data = JSON.stringify({ type: eventType, payload });
    
    for (const res of userClients) {
      // Format must follow SSE protocol: 'data: {json}\n\n'
      res.write(`data: ${data}\n\n`);
    }
  }
}

/**
 * Broadcast an event to ALL connected clients
 */
function broadcast(eventType, payload) {
  const data = JSON.stringify({ type: eventType, payload });
  for (const [userId, userClients] of clients.entries()) {
    for (const res of userClients) {
      res.write(`data: ${data}\n\n`);
    }
  }
}

/**
 * Broadcast an event only to connected admins
 */
function broadcastToAdmins(eventType, payload) {
  const data = JSON.stringify({ type: eventType, payload });
  for (const [userId, userClients] of clients.entries()) {
    for (const res of userClients) {
      if (res.user && res.user.role === 'admin') {
        res.write(`data: ${data}\n\n`);
      }
    }
  }
}

module.exports = {
  addClient,
  removeClient,
  emitToUser,
  broadcast,
  broadcastToAdmins
};
