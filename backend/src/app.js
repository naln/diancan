require('dotenv').config()
const Koa = require('koa')
const cors = require('@koa/cors')
const { koaBody } = require('koa-body')
const koaStatic = require('koa-static')
const mount = require('koa-mount')
const path = require('path')
const fs = require('fs')
const errorHandler = require('./middleware/errorHandler')
const { UPLOAD_DIR } = require('./config/constants')

const app = new Koa()

// 连接数据库
require('./config/db')()

// 确保上传目录存在
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

// 中间件
app.use(cors({
  origin: '*',
  credentials: false,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}))
app.use(koaBody({
  multipart: true,
  formidable: {
    uploadDir: UPLOAD_DIR,
    keepExtensions: true,
    multiples: false,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    onError: (err) => {
      console.error('文件上传错误:', err)
    },
    onFileBegin: (name, file) => {
      console.log('开始上传文件:', {
        name,
        originalname: file.originalFilename
      })

      // 确保上传目录存在
      if (!fs.existsSync(UPLOAD_DIR)) {
        fs.mkdirSync(UPLOAD_DIR, { recursive: true })
      }

      // 生成新的文件名
      const ext = path.extname(file.originalFilename || '')
      const filename = `${Date.now()}${ext}`
      file.filepath = path.join(UPLOAD_DIR, filename)
      file.newFilename = filename
    }
  },
  formLimit: '5mb',
  jsonLimit: '5mb',
  textLimit: '5mb',
  patchKoa: true,
  urlencoded: true
}))

// 确保上传目录存在并可写
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}
// 检查目录权限
try {
  fs.accessSync(UPLOAD_DIR, fs.constants.W_OK)
  console.log('上传目录可写:', UPLOAD_DIR)
} catch (err) {
  console.error('上传目录权限错误:', err)
}

// 错误处理
app.use(errorHandler)

// 静态文件服务
app.use(mount('/uploads', koaStatic(UPLOAD_DIR)))

// 添加日志
app.use(async (ctx, next) => {
  if (ctx.path.startsWith('/uploads')) {
    console.log('访问静态文件:', ctx.path)
  }
  await next()
})

// 路由
const authRoutes = require('./routes/auth')
const dishRoutes = require('./routes/dish')
const orderRoutes = require('./routes/order')
const adminRoutes = require('./routes/admin')

// 注册路由
app.use(authRoutes.routes()).use(authRoutes.allowedMethods())
app.use(dishRoutes.routes()).use(dishRoutes.allowedMethods())
app.use(orderRoutes.routes()).use(orderRoutes.allowedMethods())
app.use(adminRoutes.routes()).use(adminRoutes.allowedMethods())

// 404 处理
app.use(async (ctx) => {
  ctx.status = 404
  ctx.body = {
    success: false,
    message: '接口不存在'
  }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
}) 