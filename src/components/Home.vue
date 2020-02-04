<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <span>电商后台管理系统</span>
      </div>
      <!-- 退出登录 -->
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主体部分 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <!-- 添加unique-opened 不让全部菜单都展开 -->
        <el-menu background-color="#333744" text-color="#fff"  unique-opened
               :collapse="isCollapse" :collapse-transition='false' router
              :default-active="activePath"
        >
        <!-- 一级菜单 -->
        <!-- for 循环,然后给每一个菜单绑定一个独有的index -->
          <el-submenu :key="item.id" v-for="item in menulist" :index="item.id+''">
            <template slot="title">
              <!-- 图标  通过id来判断添加的字体图标-->
              <i :class="iconsObj[item.id]"></i>
              <!-- 文本 -->
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单  -->
            <!-- 绑定一个index属性,属性值是独有的字符串  页面显示就不会打开一个菜单多个菜单都打开 -->
            <!-- 添加点击事件  注册事件,传入参数是路径 -->
            <el-menu-item :index="'/'+subItem.path" :key="subItem.id" v-for="subItem in item.children" @click="saveNavState('/'+subItem.path)">
              <i class="el-icon-menu"></i>
              <span slot="title">{{subItem.authName}}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容主体 -->
      <el-main>
       <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {

  data: function () {
    return {
      // 菜单栏数据列表
      menulist: [],
      // 字体图标类名和id对应
      iconsObj: {
        '125': 'iconfont icon-users',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      // 是否折叠
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  // created中添加函数 发送异步请求的操作
  created: function () {
    // 实例创建完成后立即被调用,data和menthods可以使用,页面还没有渲染
    this.getMenuList()
    // 点击的时候把当前页面链接保存在sessionstorage中
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList () {
      // 数据结构把真实数据结构出来
      const { data: res } = await this.$http.get('menus')
      // console.log(res.data)
      // 获取失败 提示错误信息
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 获取成功后,把获取到的数据放在menulist数组中
      this.menulist = res.data
      console.log(res.data)
    },
    // 点击按钮,切换菜单的折叠与展开
    toggleCollapse () {
      this.isCollapse = !this.isCollapse
    },
    // 保存链接激活状态
    saveNavState (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }

  }
}
</script>
// 样式
<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  //使子元素两边贴紧
  justify-content: space-between;
  padding-left: 0;
  //垂直居中
  align-items: center;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    // 垂直居中
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}

</style>
