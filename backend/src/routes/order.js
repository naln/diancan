const Router = require('@koa/router')
const OrderController = require('../controllers/order')

const router = new Router()

// 创建订单 - 公开接口
router.post('/api/orders', OrderController.createOrder)

// 获取订单列表
router.get('/api/orders', OrderController.getOrders)

// 更新订单状态
router.put('/api/orders/:id/status', OrderController.updateOrderStatus)

// 更新订单菜品完成数量
router.put('/api/orders/:id/items/:dishId/complete', OrderController.updateItemCompletedQuantity)

module.exports = router 