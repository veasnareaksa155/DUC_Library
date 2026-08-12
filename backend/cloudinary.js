require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

/**
 * Uploads a base64 encoded PDF string to Cloudinary.
 * @param {string} base64Data - The base64 string of the PDF
 * @param {string} filename - The desired name for the file
 * @returns {Promise<string>} - The public secure URL of the uploaded PDF
 */
function uploadPdfToCloudinary(base64Data, filename) {
  return new Promise((resolve, reject) => {
    try {
      // Clean up base64 string if it includes the data URI scheme
      const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      
      console.log(`[Cloudinary] Uploading ${filename} to Cloudinary...`);

      // We use upload_stream for buffers. 
      // resource_type: 'raw' is usually best for documents like PDFs, 
      // but 'image' also works and allows Cloudinary's PDF to Image rendering.
      // We will use 'raw' to just store it as a file.
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          public_id: `books/${filename.replace('.pdf', '')}`,
          format: 'pdf'
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Upload error:', error);
            return reject(error);
          }
          console.log(`[Cloudinary] File uploaded successfully. URL: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      );

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      
      stream.pipe(uploadStream);
    } catch (error) {
      console.error('[Cloudinary] Sync Error processing PDF:', error);
      reject(error);
    }
  });
}

function uploadImageToCloudinary(base64Data, filename) {
  return new Promise((resolve, reject) => {
    try {
      const match = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,/);
      const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z0-9]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      
      console.log(`[Cloudinary] Uploading image ${filename} to Cloudinary...`);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          public_id: `covers/${filename.split('.')[0]}`,
        },
        (error, result) => {
          if (error) {
            console.error('[Cloudinary] Image upload error:', error);
            return reject(error);
          }
          console.log(`[Cloudinary] Image uploaded successfully. URL: ${result.secure_url}`);
          resolve(result.secure_url);
        }
      );

      const stream = new Readable();
      stream.push(buffer);
      stream.push(null);
      
      stream.pipe(uploadStream);
    } catch (error) {
      console.error('[Cloudinary] Sync Error processing Image:', error);
      reject(error);
    }
  });
}

module.exports = {
  uploadPdfToCloudinary,
  uploadImageToCloudinary,
  cloudinary
};
