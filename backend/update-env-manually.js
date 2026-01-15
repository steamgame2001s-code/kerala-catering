// backend/update-env-manually.js
const fs = require('fs');
const path = require('path');

function updateEnvManually() {
  console.log('🔄 Updating .env files with new password...\n');
  
  // Get new password from user (in real scenario, you'd get this from reset)
  const newPassword = 'Upasana2024!'; // Change this to your new password
  
  // Update backend .env
  const backendEnvPath = path.join(__dirname, '.env');
  if (fs.existsSync(backendEnvPath)) {
    let backendEnv = fs.readFileSync(backendEnvPath, 'utf8');
    backendEnv = backendEnv.replace(
      /ADMIN_PASSWORD=.*/,
      `ADMIN_PASSWORD=${newPassword}`
    );
    fs.writeFileSync(backendEnvPath, backendEnv);
    console.log('✅ Backend .env updated');
  } else {
    console.log('❌ Backend .env not found');
  }
  
  // Update frontend .env (provide instructions)
  const frontendEnvContent = `
# =================== FRONTEND .env ===================
# Copy this to frontend/.env file:

REACT_APP_DEFAULT_ADMIN_EMAIL=upasanacatering@gmail.com
REACT_APP_DEFAULT_ADMIN_PASSWORD=${newPassword}
REACT_APP_API_URL=http://localhost:5000/api

# =================== NOTES ===================
# After updating, restart both frontend and backend servers
# Frontend: npm start (in frontend folder)
# Backend: npm start (in backend folder)
  `;
  
  fs.writeFileSync('env-update-instructions.txt', frontendEnvContent);
  console.log('📝 Frontend .env instructions saved to: env-update-instructions.txt');
  
  console.log('\n🎉 ENV FILES UPDATED!');
  console.log('\nNew Credentials:');
  console.log('Email: upasanacatering@gmail.com');
  console.log(`Password: ${newPassword}`);
  console.log('\n⚠️ Important:');
  console.log('1. Restart backend server: npm start');
  console.log('2. Update frontend/.env with the new password');
  console.log('3. Restart frontend server: npm start (in frontend folder)');
}

updateEnvManually();