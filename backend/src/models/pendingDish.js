const mongoose = require('mongoose');

const pendingDishSchema = new mongoose.Schema({
    dishId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, '数量至少为1']
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'cooking', 'completed'],
            message: '无效的状态'
        },
        default: 'pending'
    },
    startTime: Date, // 开始制作时间
    completedTime: Date // 完成时间
}, {
    timestamps: true
});

// 创建索引
pendingDishSchema.index({ status: 1 });
pendingDishSchema.index({ orderId: 1 });
pendingDishSchema.index({ dishId: 1 });

// 状态变更时自动设置时间
pendingDishSchema.pre('save', function(next) {
    if (this.isModified('status')) {
        if (this.status === 'cooking') {
            this.startTime = new Date();
        } else if (this.status === 'completed') {
            this.completedTime = new Date();
        }
    }
    next();
});

module.exports = mongoose.model('PendingDish', pendingDishSchema); 