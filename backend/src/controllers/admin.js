const Dish = require('../models/dish')
const Order = require('../models/order')
const User = require('../models/user')

class AdminController {
  // 上传图片
  static async uploadImage(ctx) {
    try {
      const file = ctx.request.files?.file

      // 打印完整的请求信息
      console.log('上传文件信息:', {
        file,
        body: ctx.request.body
      })

      if (!file) {
        return ctx.body = {
          success: false,
          message: '没有接收到文件'
        }
      }

      // 返回文件信息
      ctx.body = {
        success: true,
        data: {
          path: `/uploads/${file.newFilename}`,
          url: `${process.env.SERVER_URL || 'http://localhost:3000'}/uploads/${file.newFilename}`
        }
      }
    } catch (error) {
      console.error('上传出错:', error)
      ctx.body = {
        success: false,
        message: '文件上传失败，请重试'
      }
    }
  }

  // 添加菜品
  static async addDish(ctx) {
    try {
      const dishData = ctx.request.body
      
      // 确保价格是数字类型
      if (dishData.price) {
        dishData.price = Number(dishData.price)
      }

      const dish = await Dish.create(dishData)
      
      ctx.body = {
        success: true,
        data: dish
      }
    } catch (error) {
      console.error('添加菜品失败:', error)
      ctx.throw(500, error.message)
    }
  }

  // 更新菜品
  static async updateDish(ctx) {
    try {
      const { id } = ctx.params
      const updateData = ctx.request.body

      // 确保价格是数字类型
      if (updateData.price) {
        updateData.price = Number(updateData.price)
      }

      const dish = await Dish.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      )

      if (!dish) {
        ctx.throw(404, '菜品不存在')
      }

      ctx.body = {
        success: true,
        data: dish
      }
    } catch (error) {
      console.error('更新菜品失败:', error)
      ctx.throw(500, error.message)
    }
  }

  // 删除菜品
  static async deleteDish(ctx) {
    try {
      const { id } = ctx.params
      const dish = await Dish.findByIdAndDelete(id)

      if (!dish) {
        ctx.throw(404, '菜品不存在')
      }

      ctx.body = {
        success: true,
        message: '删除成功'
      }
    } catch (error) {
      console.error('删除菜品失败:', error)
      ctx.throw(500, error.message)
    }
  }

  // 添加数据统计接口
  static async getStatistics(ctx) {
    try {
      const { startDate, endDate } = ctx.query
      const query = {}
      if (startDate && endDate) {
        // 开始日期使用当天开始时间
        const start = new Date(startDate)
        start.setHours(0, 0, 0, 0)

        // 结束日期使用当天结束时间
        const end = new Date(endDate)
        if (end.toISOString().includes('T23:59:59')) {
          // 如果已经包含了时间，直接使用
          query.createdAt = {
            $gte: start,
            $lte: end
          }
        } else {
          // 否则设置为当天结束
          end.setHours(23, 59, 59, 999)
          query.createdAt = {
            $gte: start,
            $lte: end
          }
        }
      }

      // 获取订单统计
      const orders = await Order.find(query).populate('items.dish')
      
      // 只统计菜品销量
      const dishStats = {}
      
      orders.forEach(order => {
        order.items.forEach(item => {
          if (!item.dish) return  // 跳过没有菜品信息的项

          const dishId = item.dish._id.toString()
          if (!dishStats[dishId]) {
            dishStats[dishId] = {
              name: item.dish.name,
              quantity: 0
            }
          }
          dishStats[dishId].quantity += item.quantity
        })
      })

      ctx.body = {
        success: true,
        data: {
          dishStats
        }
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      ctx.throw(500, {
        success: false,
        message: error.message || '获取统计数据失败'
      })
    }
  }

  // 添加用户管理接口
  static async getUsers(ctx) {
    try {
      const users = await User.find({}, { password: 0 })
      ctx.body = {
        success: true,
        data: users
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }

  static async createUser(ctx) {
    try {
      const userData = ctx.request.body
      const user = await User.create(userData)
      ctx.body = {
        success: true,
        data: {
          id: user._id,
          username: user.username,
          role: user.role,
          status: user.status
        }
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }

  static async updateUser(ctx) {
    try {
      const { id } = ctx.params
      const updateData = ctx.request.body
      const user = await User.findByIdAndUpdate(
        id,
        updateData,
        { new: true, select: '-password' }
      )
      if (!user) {
        ctx.throw(404, '用户不存在')
      }
      ctx.body = {
        success: true,
        data: user
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }

  static async deleteUser(ctx) {
    try {
      const { id } = ctx.params
      const user = await User.findByIdAndDelete(id)
      if (!user) {
        ctx.throw(404, '用户不存在')
      }
      ctx.body = {
        success: true,
        message: '删除成功'
      }
    } catch (error) {
      ctx.throw(500, error.message)
    }
  }
}

module.exports = AdminController 