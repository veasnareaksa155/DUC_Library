const bcrypt = require('bcryptjs');
const ORM = require('../googleSheetsORM'); 

async function createAdmin() {
  try {
    await ORM.initializeSheets();
    
    const users = await ORM.getAll('Users');
    const existingAdmin = users.find(u => u.email === 'admin@duc.com');
    
    if (existingAdmin) {
      console.log('Admin account already exists in the Google Sheet.');
      process.exit(0);
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await ORM.insert('Users', {
      name: 'Super Admin',
      email: 'admin@duc.com',
      password: hashedPassword,
      role: 'admin',
      created_at: new Date().toISOString()
    });

    console.log('Successfully created admin account in Google Sheets!');
    console.log('Email: admin@duc.com');
    console.log('Password: admin123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
