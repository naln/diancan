const Order = require('../models/order')
const Dish = require('../models/dish')

class OrderController {
  // 创建订单
  static async createOrder(ctx) {
    try {
      const { items } = ctx.request.body
      
      // 验证订单数据
      if (!items || !Array.isArray(items) || items.length === 0) {
        ctx.throw(400, '订单数据不完整')
      }

      // 验证每个菜品是否存在并计算总金额
      let totalAmount = 0
      const validatedItems = []

      for (const item of items) {
        console.log(':', item)
        const dish = await Dish.findById(item.dish)
        if (!dish) {
          ctx.throw(400, `菜品 ${item.dish} 不存在`)
        }

        // 验证价格是否匹配
        if (dish.price !== item.price) {
          ctx.throw(400, `菜品 ${dish.name} 价格不匹配`)
        }

        // 计算该项的总价
        const itemTotal = dish.price * item.quantity
        totalAmount += itemTotal

        // 添加到验证后的订单项
        validatedItems.push({
          dish: dish._id,
          quantity: item.quantity,
          price: dish.price
        })
      }

      // 创建订单数据
      const orderData = {
        items: validatedItems,
        totalAmount,  // 使用 totalAmount 而不是 total
        status: 'pending'
      }

      // 如果用户已登录，添加用户ID
      if (ctx.state.user) {
        orderData.user = ctx.state.user.id
      }

      const order = await Order.create(orderData)

      ctx.body = {
        success: true,
        data: order
      }
    } catch (error) {
      console.error('创建订单失败:', error)
      ctx.throw(error.status || 500, error.message)
    }
  }

  // 获取订单列表
  static async getOrders(ctx) {
    try {
      const orders = await Order.find()
        .populate({
          path: 'items.dish',
          model: 'Dish',
          select: '_id name price status image'  // 添加 image 字段
        })
        .sort({ createdAt: -1 })

      // 过滤掉无效的订单数据
      const validOrders = orders.filter(order => 
        order.items && 
        order.items.length > 0 && 
        order.items.every(item => item.dish)
      )

      // 处理图片路径，确保返回完整URL
      const processedOrders = validOrders.map(order => {
        const orderObj = order.toObject()
        return orderObj
      })

      ctx.body = {
        success: true,
        data: processedOrders
      }
    } catch (error) {
      console.error('获取订单列表失败:', error)
      ctx.throw(500, error.message)
    }
  }

  // 更新订单状态
  static async updateOrderStatus(ctx) {
    const { id } = ctx.params
    const status = ctx.request.body.status || ctx.request.body // 支持直接传字符串

    try {
      const order = await Order.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).populate('items.dish')

      if (!order) {
        ctx.throw(404, '订单不存在')
      }

      ctx.body = {
        success: true,
        data: order
      }
    } catch (error) {
      console.error('更新订单状态失败:', error)
      ctx.throw(500, error.message)
    }
  }

  // 添加更新完成数量的方法
  static async updateOrderQuantity(ctx) {
    const { id } = ctx.params
    const { completedQuantity } = ctx.request.body

    try {
      const order = await Order.findByIdAndUpdate(
        id,
        { completedQuantity },
        { new: true }
      ).populate('items.dish')

      if (!order) {
        ctx.throw(404, '订单不存在')
      }

      ctx.body = {
        success: true,
        data: order
      }
    } catch (error) {
      console.error('更新订单完成数量失败:', error)
      ctx.throw(500, error.message)
    }
  }

  // 更新订单菜品完成数量
  static async updateItemCompletedQuantity(ctx) {
    const { id, dishId } = ctx.params
    const { completedQuantity } = ctx.request.body

    try {
      const order = await Order.findById(id)
      if (!order) {
        ctx.throw(404, '订单不存在')
      }

      // 找到对应的菜品项
      const item = order.items.find(item => item.dish.toString() === dishId)
      if (!item) {
        ctx.throw(404, '订单中不存在该菜品')
      }

      // 验证完成数量
      if (completedQuantity < 0 || completedQuantity > item.quantity) {
        ctx.throw(400, '完成数量无效')
      }

      // 更新完成数量（累加而不是覆盖）
      const newCompletedQuantity = (item.completedQuantity || 0) + completedQuantity
      if (newCompletedQuantity > item.quantity) {
        ctx.throw(400, '完成数量超过订单数量')
      }
      
      item.completedQuantity = newCompletedQuantity

      // 检查是否所有菜品都完成了
      const allCompleted = order.items.every(item => 
        item.completedQuantity === item.quantity
      )
      if (allCompleted) {
        order.status = 'completed'
      }

      await order.save()

      ctx.body = {
        success: true,
        data: order
      }
    } catch (error) {
      console.error('更新订单菜品完成数量失败:', error)
      ctx.throw(error.status || 500, error.message)
    }
  }
}

module.exports = OrderController 