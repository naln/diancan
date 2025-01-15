import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/customer',
    name: 'Customer',
    component: () => import(/* webpackChunkName: "customer" */ '@/views/customer/Index.vue')
  },
  {
    path: '/chef',
    name: 'Chef',
    component: () => import(/* webpackChunkName: "chef" */ '@/views/chef/Index.vue')
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import(/* webpackChunkName: "admin" */ '@/views/admin/Index.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 