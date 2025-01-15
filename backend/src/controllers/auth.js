const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

class AuthController {
  // 登录
  static async login(ctx) {
    try {
      console.log('收到登录请求:', ctx.request.body)
      const { username, password, role } = ctx.request.body

      // 根据用户名和角色查找用户
      const user = await User.findOne({ username, role })
      
      console.log('查找用户结果:', user ? {
        id: user._id,
        username: user.username,
        role: user.role,
        status: user.status
      } : '未找到用户')

      if (!user) {
        console.log('用户不存在')
        ctx.throw(401, '用户名或密码错误')
      }

      // 检查用户状态
      if (!user.status) {
        console.log('用户已被禁用')
        ctx.throw(403, '账号已被禁用')
      }

      // 验证密码
      const isValid = await user.comparePassword(password)
      console.log('密码验证结果:', isValid)
      
      if (!isValid) {
        console.log('密码错误')
        ctx.throw(401, '用户名或密码错误')
      }


      ctx.body = {
        success: true,
        data: {
          user: {
            id: user._id,
            username: user.username,
            role: user.role
          }
        }
      }
    } catch (error) {
      console.error('登录错误:', {
        status: error.status,
        message: error.message,
        stack: error.stack
      })
      ctx.throw(error.status || 500, error.message)
    }
  }

  // 登出（保留但简化）
  static async logout(ctx) {
    ctx.body = {
      success: true,
      message: '已退出登录'
    }
  }
}

module.exports = AuthController 