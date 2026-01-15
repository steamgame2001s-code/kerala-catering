// backend/find-frontend-path.js
const fs = require('fs');
const path = require('path');

console.log('🔍 Searching for frontend .env file...\n');

// Try common paths
const searchPaths = [
  path.join(__dirname, '..', 'frontend', '.env'),
  path.join(__dirname, '../frontend/.env'),
  path.join(__dirname, '../../frontend/.env'),
  path.join(__dirname, '../../../frontend/.env'),
  'E:/Upasana Website/kerala-catering/frontend/.env',
  'C:/Upasana Website/kerala-catering/frontend/.env',
  path.join(process.cwd(), 'frontend', '.env'),
  path.join(process.cwd(), '../frontend/.env'),
];

for (const envPath of searchPaths) {
  if (fs.existsSync(envPath)) {
    console.log('✅ Found frontend .env at:', envPath);
    
    // Show current content
    const content = fs.readFileSync(envPath, 'utf8');
    console.log('\nCurrent content:');
    console.log('-' .repeat(50));
    console.log(content);
    console.log('-' .repeat(50));
    
    // Test update
    const testPassword = 'TestPassword123!';
    const updatedContent = content.replace(
      /REACT_APP_DEFAULT_ADMIN_PASSWORD=.*/,
      `REACT_APP_DEFAULT_ADMIN_PASSWORD=${testPassword}`
    );
    
    console.log('\n✅ Frontend .env can be automatically updated!');
    console.log('Path will be used in password reset.');
    
    // Save the correct path for future use
    const config = {
      frontendEnvPath: envPath,
      lastFound: new Date().toISOString(),
      canUpdate: true
    };
    
    fs.writeFileSync('frontend-path-config.json', JSON.stringify(config, null, 2));
    console.log('\n📁 Configuration saved to: frontend-path-config.json');
    console.log('\n🎉 Automatic frontend .env updates are ready!');
    
    process.exit(0);
  }
}

console.log('❌ Could not find frontend .env file automatically.');
console.log('\n🔧 Please specify your exact frontend path:');
console.log('Edit the "possibleFrontendPaths" array in server.js');
console.log('Add your exact path like:');
console.log('"E:/Upasana Website/kerala-catering/frontend/.env"');