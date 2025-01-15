const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    items: [{
        dish: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        completedQuantity: {
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: true
        }
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'cancelled'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 