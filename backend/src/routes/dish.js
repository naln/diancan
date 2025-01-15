const Router = require('@koa/router')
const DishController = require('../controllers/dish')

const router = new Router()

// 获取菜品列表
router.get('/api/dishes', DishController.getDishes)

// 获取单个菜品
router.get('/api/dishes/:id', DishController.getDishById)

module.exports = router 