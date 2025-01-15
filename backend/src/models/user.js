const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, '用户名不能为空'],
        unique: true,
        trim: true,
        minlength: [2, '用户名至少2个字符'],
        maxlength: [20, '用户名最多20个字符']
    },
    password: {
        type: String,
        required: [true, '密码不能为空'],
        minlength: [6, '密码至少6个字符']
    },
    role: {
        type: String,
        enum: {
            values: ['admin', 'chef'],
            message: '无效的角色类型'
        },
        required: true
    },
    status: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// 创建索引
userSchema.index({ username: 1 }, { unique: true });

// 密码加密中间件
userSchema.pre('save', async function(next) {
    // 只有在密码被修改时才重新加密
    if (!this.isModified('password')) return next();
    
    try {
        // 使用更高的加密轮数
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        console.log('密码加密:', {
            original: this.password,
            hashed: hashedPassword
        });
        this.password = hashedPassword;
        next();
    } catch (error) {
        console.error('密码加密失败:', error);
        next(error);
    }
});

// 验证密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // 直接使用 bcrypt.compare
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('密码验证:', {
            candidate: candidatePassword,
            stored: this.password,
            isMatch: isMatch
        });
        return isMatch;
    } catch (error) {
        console.error('密码验证失败:', error);
        return false;
    }
};

module.exports = mongoose.model('User', userSchema); 