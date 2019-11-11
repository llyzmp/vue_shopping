import Vue from 'vue'
import { Button } from 'element-ui'

// 按需导入
import { Form, FormItem, Input,Message } from 'element-ui'  

//配置全局
Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.prototype.$message = Message

