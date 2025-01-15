import { createStore } from 'vuex'
import api from '@/api'
import speech from '@/utils/speech'

const store = createStore({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    cart: [],
    user: null
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user
    },
    clearUserInfo(state) {
      state.user = null
    },
    // 添加购物车相关的 mutations
    ADD_TO_CART(state, dish) {
      const existingItem = state.cart.find(item => item._id === dish._id)
      if (existingItem) {
        existingItem.quantity++
      } else {
        state.cart.push({ ...dish, quantity: 1 })
      }
    },
    REMOVE_FROM_CART(state, dishId) {
      const index = state.cart.findIndex(item => item._id === dishId)
      if (index > -1) {
        state.cart.splice(index, 1)
      }
    },
    UPDATE_CART_ITEM_QUANTITY(state, { dishId, quantity }) {
      const item = state.cart.find(item => item._id === dishId)
      if (item && quantity >= 1) {
        item.quantity = quantity
      }
    },
    CLEAR_CART(state) {
      state.cart = []
    }
  },
  actions: {
    // 提交订单
    async submitOrder({ commit, state }, orderData) {
      try {
        const response = await api.createOrder(orderData)
        commit('CLEAR_CART')
        return response.data
      } catch (error) {
        console.error('Submit order error:', error)
        throw error
      }
    }
  },
  getters: {
    cartTotal: state => state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    cartCount: state => state.cart.reduce((sum, item) => sum + item.quantity, 0),
    userRole: state => state.user?.role,
    isLoggedIn: state => !!state.user,
    username: state => state.user?.username
  }
})

store.$api = api

export default store 