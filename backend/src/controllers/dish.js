const Dish = require('../models/dish')

class DishController {
  // 获取所有菜品
  static async getDishes(ctx) {
    try {
      const dishes = await Dish.find().sort({ createdAt: -1 })
      
      // 只返回相对路径，不拼接完整URL
      const processedDishes = dishes.map(dish => {
        const dishObj = dish.toObject()
        return dishObj
      })

      ctx.body = {
        success: true,
        data: processedDishes
      }
    } catch (error) {
      console.error('获取菜品列表失败:', error)
      ctx.throw(500, error.message)
    }
  }

  // 获取单个菜品
  static async getDishById(ctx) {
    try {
      const dish = await Dish.findById(ctx.params.id)
      if (!dish) {
        ctx.throw(404, '菜品不存在')
      }

      ctx.body = {
        success: true,
        data: dish
      }
    } catch (error) {
      console.error('获取菜品详情失败:', error)
      ctx.throw(500, error.message)
    }
  }
}

module.exports = DishController 