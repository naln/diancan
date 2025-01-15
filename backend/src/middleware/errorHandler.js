module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.error('错误处理中间件捕获到错误:', {
      status: err.status,
      message: err.message,
      stack: err.stack,
      originalError: err
    })
    
    ctx.status = err.status || 500
    ctx.body = {
      success: false,
      message: err.message === 'Unexpected end of form' ? '文件上传失败，请重试' : (err.message || '服务器内部错误')
    }
  }
} 