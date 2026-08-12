const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');

// Path to Google Service Account Credentials JSON
function getCredentialsPath() {
  const p1 = path.join(__dirname, 'google-credentials.json');
  const p2 = path.join(__dirname, 'google-credentials.json.json');
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return p1;
}

// Initialize Google Drive Client
async function getGoogleDriveClient() {
  const credPath = getCredentialsPath();
  if (!fs.existsSync(credPath)) {
    throw new Error('Google credentials file not found.');
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: credPath,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const client = await auth.getClient();
  return google.drive({ version: 'v3', auth: client });
}

/**
 * Uploads a base64 encoded PDF string to Google Drive and makes it publicly accessible.
 * @param {string} base64Data - The base64 string of the PDF (can include data URI scheme)
 * @param {string} filename - The desired name for the file in Google Drive
 * @returns {Promise<string>} - The public web view link of the uploaded PDF
 */
async function uploadPdfToDrive(base64Data, filename) {
  try {
    const drive = await getGoogleDriveClient();

    // Clean up base64 string if it includes the data URI scheme
    const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    
    // Convert Buffer to Readable Stream
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    console.log(`[GoogleDrive] Uploading ${filename} to Google Drive...`);

    // Create file metadata
    const fileMetadata = {
      name: filename,
      mimeType: 'application/pdf',
    };

    // Create the file
    const file = await drive.files.create({
      resource: fileMetadata,
      media: {
        mimeType: 'application/pdf',
        body: stream,
      },
      fields: 'id, webViewLink, webContentLink',
    });

    const fileId = file.data.id;
    console.log(`[GoogleDrive] File uploaded successfully. ID: ${fileId}`);

    // Make the file public so anyone with the link can view it
    await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    console.log(`[GoogleDrive] File made public. Link: ${file.data.webViewLink}`);
    return file.data.webViewLink; // You can also return webContentLink if you prefer direct download
  } catch (error) {
    console.error('[GoogleDrive] Error uploading PDF:', error);
    throw new Error('Failed to upload PDF to Google Drive');
  }
}

module.exports = {
  uploadPdfToDrive,
};
