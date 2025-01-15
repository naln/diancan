const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '菜品名称不能为空'],
        trim: true,
        minlength: [2, '菜品名称至少2个字符'],
        maxlength: [20, '菜品名称最多20个字符']
    },
    price: {
        type: Number,
        required: [true, '价格不能为空'],
        min: [0, '价格不能小于0']
    },
    description: {
        type: String,
        required: [true, '描述不能为空'],
        trim: true
    },
    image: {
        type: String,
        required: [true, '图片不能为空']
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Dish', dishSchema); 