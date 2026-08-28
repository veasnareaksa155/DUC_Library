const { authenticator } = require('otplib');
const QRCode = require('qrcode');

async function test() {
  try {
    const secret = authenticator.generateSecret();
    console.log('Secret:', secret);
    const otpauth = authenticator.keyuri('test@example.com', 'DUC Library', secret);
    console.log('OTP Auth URI:', otpauth);
    const qrCodeUrl = await QRCode.toDataURL(otpauth);
    console.log('QR Code generated successfully. Length:', qrCodeUrl.length);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
