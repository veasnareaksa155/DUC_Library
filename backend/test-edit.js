const fetch = require('node-fetch');

async function test() {
  console.log('Sending request...');
  // Create a minimal fake PDF in base64
  const dummyPdf = 'JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDMgMCBSL0ZpbHRlci9GbGF0ZURlY29kZT4+CnN0cmVhbQp4nDPQM1Qo5ypUMFAwALJMLY30jE2UjA0sDIwNdAwMDUxBokC+MVDcWMnY1MDIxMzEyAAooGBsrm9upmVgaGqia2RqZmSia2hkDBRoZWhgoGugZWZgYGgEAAgNDG0KZW5kc3RyZWFtCmVuZG9iagoKCjMgMCBvYmoKNDQKZW5kb2JqCgoxIDAgb2JqCjw8L1R5cGUvUGFnZS9NZWRpYUJveFswIDAgNTk1LjI4IDg0MS44OV0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDQgMCBSPj4+Pi9Db250ZW50cyAyIDAgUi9QYXJlbnQgNSAwIFI+PgplbmRvYmoKCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhPj4KZW5kb2JqCgo1IDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzWzEgMCBSXT4+CmVuZG9iagoKNyAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgNSAwIFI+PgplbmRvYmoKCjYgMCBvYmoKPDwvUHJvZHVjZXIoQ2FudmEpL0NyZWF0aW9uRGF0ZShEOjIwMjQwMTAxMTIwMDAwWikvTW9kRGF0ZShEOjIwMjQwMTAxMTIwMDAwWik+PgplbmRvYmoKCnhyZWYKMCA4CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDE2NCAwMDAwMCBuIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxNDIgMDAwMDAgbiAKMDAwMDAwMDI2OCAwMDAwMCBuIAowMDAwMDAwMzU2IDAwMDAwIG4gCjAwMDAwMDA0ODMgMDAwMDAgbiAKMDAwMDAwMDQzMyAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgOC9Sb290IDcgMCBSL0luZm8gNiAwIFI+PgpzdGFydHhyZWYKNjAyCiUlRU9GCg==';

  const body = {
    title: 'Test Book',
    author: 'Tester',
    pdf_url: `data:application/pdf;base64,${dummyPdf}`,
    digital_content: '',
    copies_total: 1,
    category_id: 1,
  };

  try {
    const res = await fetch('http://localhost:5001/api/books/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // Mock authorization may fail, but let's see if it hangs or returns 401/403
        Authorization: 'Bearer test'
      },
      body: JSON.stringify(body)
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
