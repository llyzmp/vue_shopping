import Vue from 'vue'
import Router from 'vue-router'
// 导入登录组件
import Login from './components/Login.vue'
import Home from './components/Home.vue'
import Welcome from './components/Welcome.vue'
import Users from './components/user/Users.vue'
import Rights from './components/power/Rights.vue'
import Roles from './components/power/Roles.vue'
import Cate from './components/goods/Cate.vue'
import Param from './components/goods/Params.vue'
import GoodsList from './components/goods/Lists.vue'
import AddGoods from './components/goods/Add.vue'
import Order from './components/order/Order.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params',component:Param},
        { path: '/goods',component:GoodsList},
        { path: '/goods/add', component: AddGoods},
        { path: '/orders', component: Order}
      ]
    }
  ]
})

// 挂载路由守
router.beforeEach((to, from, next) => {
  // to是要访问的路径
  // from是从哪个路径跳转而来
  // next是一个函数,代表放行  next('/login) 强制跳转
  if (to.path == '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
