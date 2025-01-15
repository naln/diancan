const fs = require('fs')
const path = require('path')
const { UPLOAD_DIR } = require('../config/constants')

// 确保上传目录存在
const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

// 生成文件名
const generateFileName = (originalName) => {
  const ext = path.extname(originalName).toLowerCase()
  return `${Date.now()}${ext}`
}

// 验证文件类型
const validateFileType = (file) => {
  // 获取文件的 MIME 类型
  const mimeType = file.mimetype
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
  
  // 检查 MIME 类型
  if (!allowedTypes.includes(mimeType)) {
    return false
  }

  // 检查文件扩展名
  const ext = path.extname(file.originalFilename).toLowerCase()
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif']
  return allowedExts.includes(ext)
}

// 验证文件大小
const validateFileSize = (file) => {
  const maxSize = 2 * 1024 * 1024 // 2MB
  return file.size <= maxSize
}

module.exports = {
  ensureUploadDir,
  generateFileName,
  validateFileType,
  validateFileSize
} 