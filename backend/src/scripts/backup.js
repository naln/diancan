const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const BACKUP_DIR = path.join(__dirname, '../../backups')
const DB_NAME = 'restaurant_db'

// 确保备份目录存在
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

// 生成备份文件名
const getBackupFileName = () => {
  const date = new Date()
  return `${DB_NAME}_${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}_${date.getHours().toString().padStart(2, '0')}${date.getMinutes().toString().padStart(2, '0')}.gz`
}

// 执行备份
const backup = () => {
  const backupFile = path.join(BACKUP_DIR, getBackupFileName())
  const mongodump = spawn('mongodump', [
    `--db=${DB_NAME}`,
    `--archive=${backupFile}`,
    '--gzip'
  ])

  mongodump.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`)
  })

  mongodump.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`)
  })

  mongodump.on('close', (code) => {
    if (code === 0) {
      console.log(`数据库备份成功: ${backupFile}`)
      // 删除旧的备份文件（保留最近7天的备份）
      cleanOldBackups()
    } else {
      console.error(`数据库备份失败，退出码: ${code}`)
    }
  })
}

// 清理旧备份
const cleanOldBackups = () => {
  const files = fs.readdirSync(BACKUP_DIR)
  const now = new Date()
  
  files.forEach(file => {
    const filePath = path.join(BACKUP_DIR, file)
    const stats = fs.statSync(filePath)
    const days = (now - stats.mtime) / (1000 * 60 * 60 * 24)
    
    if (days > 7) {
      fs.unlinkSync(filePath)
      console.log(`已删除旧备份: ${file}`)
    }
  })
}

// 执行备份
backup() 