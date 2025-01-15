const Router = require('@koa/router')
const AuthController = require('../controllers/auth')

const router = new Router({
  prefix: '/api/auth'
})

router.post('/login', AuthController.login)
router.post('/logout', AuthController.logout)

module.exports = router 