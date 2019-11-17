<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <el-table :data="rightsList" border style="width: 100%" stripe>
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="权限名称" prop="authName"> </el-table-column>
        <el-table-column label="路径" prop="path"> </el-table-column>
        <el-table-column label="权限等级" prop="level">
           <template slot-scope="scope">
                <el-tag v-if="scope.row.level === '0'" >一级</el-tag>
                <el-tag type="success"   v-else-if="scope.row.level === '1'" >二级</el-tag>
                <el-tag type="warning" v-else >三级</el-tag>
           </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      // 获取限列表数据
      rightsList: []
    }
  },

  // 钩子函数,页面没有渲染,可以使用data数据和methods方法
  created () {
    this.getRightsList()
  },
  methods: {
    // 获取用户列表数据
    async  getRightsList () {
      // 发送请求
      const { data: res } = await this.$http.get('rights/list')
      // console.log(res)
      // 把获取到的数据赋值给上边data中的存放数据的数组
      this.rightsList = res.data
    }
  }
}
</script>

<style lang="less" scoped></style>
