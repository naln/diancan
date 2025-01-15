const path = require('path')

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRE: '24000h',
  UPLOAD_DIR: path.join(__dirname, '../../public/uploads'),
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    CHEF: 'chef'
  }
} 