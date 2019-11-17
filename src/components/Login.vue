<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/lufei.png" alt />
      </div>
      <!-- 登录表单区域 -->
      <el-form class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFromRef">
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button @click="login">提交</el-button>
          <el-button @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 登录页面绑定数据
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 这里是表单验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在3-10个字符', trigger: 'blur' }
        ],
        // 验证密码是否合法
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击按钮重置,重置登录表单
    resetLoginForm: function () {
      // console.log(this);
      // 表单添加了ref属性属性值为loginFormRef
      // 在vue组件实例下边有$ref下边loginFromRef表单,使用resetFields()方法,重置表单
      this.$refs.loginFromRef.resetFields()
    },
    login: function () {
      // console.log(this);
      // 同样使用this.$refs.loginFromRef 使用方法validate();
      // 这个方法,可以传入一个回调函数,第一个形参是布尔值,判断验证成功;
      // 验证成功的后发送请求，使用axios
      this.$refs.loginFromRef.validate(async (valid) => {
        if (!valid) return
        // //把返回来的真实数据展示出来
        const { data: res } = await this.$http.post('login', this.loginForm)
        // //
        // console.log(ret);
        // 使用elementui中的message组件,需要在element.js中引入
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登陆成功')
        // 1.将登录后的token 保存到客户端的sessionStorage中,
        // 项目中除了登录之外的其他API接口,必须在登录之后才能访问
        // token  只应在当前网站打开期间生效,所以讲token报讯在sessionStorage中
        //
        window.sessionStorage.setItem('token', res.data.token)

        // 通过编程式导航跳转到后台主页,路由地址是 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>

// 样式
<style lang="less" scoped>
// 最外边的盒子
.login_container {
  background-color: #2c3e50;
  height: 100%;
}
//登录框盒子
.login_box {
  width: 450px;
  height: 300px;
  background-color: #eee;
  border-radius: 5px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  .avatar_box {
    width: 130px;
    height: 130px;
    background-color: #eee;
    border-radius: 50%;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  .login_form {
    margin: 100px 20px 0 20px;
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
