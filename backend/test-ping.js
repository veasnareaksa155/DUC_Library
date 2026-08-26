const http = require('http');

const data = JSON.stringify({
  session_id: 'test-session-999',
  book_title: 'My Test Book'
});

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/books/123/read-ping',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
