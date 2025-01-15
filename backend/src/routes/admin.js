const Router = require('@koa/router')
const AdminController = require('../controllers/admin')

const router = new Router()

// 添加菜品
router.post('/api/admin/dishes', AdminController.addDish)

// 更新菜品
router.put('/api/admin/dishes/:id', AdminController.updateDish)

// 删除菜品
router.delete('/api/admin/dishes/:id', AdminController.deleteDish)

// 上传图片
router.post('/api/admin/upload', AdminController.uploadImage)

// 数据统计
router.get('/api/admin/statistics', AdminController.getStatistics)

// 用户管理
router.get('/api/admin/users', AdminController.getUsers)
router.post('/api/admin/users', AdminController.createUser)
router.put('/api/admin/users/:id', AdminController.updateUser)
router.delete('/api/admin/users/:id', AdminController.deleteUser)

module.exports = router 