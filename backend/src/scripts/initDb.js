const mongoose = require('mongoose')
require('dotenv').config()
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const Dish = require('../models/dish')

// 数据库配置
const dbConfig = {
  url: process.env.MONGODB_URI,
  options: {
    autoIndex: true
  }
}

// 初始管理员数据
const adminData = {
  username: 'admin',
  password: 'admin123',
  role: 'admin',
  status: true
}

// 初始厨师数据
const chefData = {
  username: 'chushi',
  password: 'chushi123',
  role: 'chef',
  status: true
}

// 示例菜品数据
const sampleDishes = [
  {
    name: '宫保鸡丁',
    price: 38.0,
    description: '经典川菜，口感麻辣鲜香',
    image: '/uploads/kungpao-chicken.jpg',
    status: true
  },
  {
    name: '水煮鱼',
    price: 58.0,
    description: '新鲜草鱼片，麻辣鲜香',
    image: '/uploads/boiled-fish.jpg',
    status: true
  },
  {
    name: '青椒炒蛋',
    price: 18.0,
    description: '家常小炒，清淡可口',
    image: '/uploads/pepper-egg.jpg',
    status: true
  }
]

// 初始化数据库
async function initializeDb() {
  try {
    // 连接数据库
    console.log('正在连接数据库...')
    await mongoose.connect(dbConfig.url)
    console.log('已连接到MongoDB')

    // 清空现有数据
    console.log('正在清空现有数据...')
    await Promise.all([
      User.deleteMany({}),
      Dish.deleteMany({})
    ])
    console.log('已清空现有数据')

    // 创建管理员账号
    console.log('正在创建初始用户账号...')
    try {
        // 直接使用明文密码创建用户，让中间件处理加密
        const admin = new User({
            username: adminData.username,
            password: adminData.password, // 直接使用明文密码
            role: adminData.role,
            status: adminData.status
        });
        await admin.save();
        console.log('管理员账号创建成功:', admin.username);

        const chef = new User({
            username: chefData.username,
            password: chefData.password, // 直接使用明文密码
            role: chefData.role,
            status: chefData.status
        });
        await chef.save();
        console.log('厨师账号创建成功:', chef.username);

    } catch (error) {
        console.error('创建用户失败:', error);
        throw error;
    }

    // 创建示例菜品
    console.log('正在创建示例菜品...')
    await Dish.insertMany(sampleDishes)
    console.log('已创建示例菜品')

    console.log('数据库初始化完成！')
    console.log('管理员账号：', adminData.username)
    console.log('管理员密码：', adminData.password)
    console.log('厨师账号：', chefData.username)
    console.log('厨师密码：', chefData.password)

  } catch (error) {
    console.error('数据库初始化失败:', error)
  } finally {
    await mongoose.connection.close()
    process.exit(0)
  }
}

// 运行初始化
initializeDb() 