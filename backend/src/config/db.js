const mongoose = require('mongoose')
require('dotenv').config()

// 数据库配置
const dbConfig = {
  url: process.env.MONGODB_URI,
  options: {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
  }
}

// 连接错误处理
mongoose.connection.on('error', (err) => {
  console.error('MongoDB连接错误:', err)
})

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB连接断开，尝试重新连接...')
})

mongoose.connection.on('connected', () => {
  console.log('MongoDB连接成功')
})

// 监听进程终止信号
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close()
    console.log('MongoDB连接已关闭')
    process.exit(0)
  } catch (err) {
    console.error('关闭MongoDB连接时出错:', err)
    process.exit(1)
  }
})

// 连接数据库
const connectDB = async () => {
  try {
    await mongoose.connect(dbConfig.url, dbConfig.options)
  } catch (error) {
    console.error('数据库连接失败:', error)
    process.exit(1)
  }
}

module.exports = connectDB 