<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格数据 -->
      <el-table :data="rolelist" style="width: 100%" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <!-- //权限分配 -->
            <el-row
              :gutter="24"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
              :class="['bb', i1 == 0 ? 'tb' : 'bb', 'vcenter']"
            >
              <!-- // 栅格系统,分两列 一级权限分5 二三合起来分19 -->
              <!-- 一级权限 -->
              <el-col :span="5">
                <!-- 删除角色标签,传入两个参数,角色名称的id,和该角色下要删除的id -->
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item1.id)"
                  >{{ item1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- //二三级 -->
              <el-col :span="19">
                <el-row
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                  :class="[i2 == 0 ? '' : 'tb', 'vcenter']"
                >
                  <!-- 再分两列 -->
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag
                      closable
                      type="success"
                      @close="removeRightById(scope.row, item2.id)"
                      >{{ item2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      closable
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      @close="removeRightById(scope.row, item3.id)"
                    >
                      {{ item3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"> </el-table-column>
        <el-table-column label="角色名称" prop="roleName"> </el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"> </el-table-column>
        <el-table-column label="操作" width="300px">
         <template slot-scope='scope'>
            <el-button type="primary" icon="el-icon-edit" size="mini"> 编辑</el-button >
          <el-button type="danger" icon="el-icon-delete" size="mini" >删除</el-button>
          <el-button type="warning" icon="el-icon-setting" size="mini"  @click="showSetRightDialog(scope.row)" >分配权限</el-button >
         </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- //展示分配权限的消息对话框 -->
    <el-dialog title="权限分配" :visible.sync="setRightDialogVisible" @close="setRightDialogClosed">
      <span>
        <!-- 树形组件展示三级权限列表 -->
        <el-tree
          :data="rightslist"
          show-checkbox
          node-key="id"
          :default-checked-keys="defkeys"
          :default-expand-all='true'
          :props="treeProps"
          ref="treeRef"
        >
        </el-tree>
      </span>
      <span slot="footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      //存放数据列表数据
      rolelist: [],
      //分配权限展示隐藏判断依据
      setRightDialogVisible: false,
      //存放所有权限列表数据
      rightslist: [],
      //树形组件中的属性  对象里边label就是要展示的每一级的名称,children就是下一级的属性名
      treeProps:{
        label:'authName',
        children:'children'
      },
      //被勾选上的节点数组中的数据
      defkeys:[],
      //点击分配权限的时候,把选择该项的id存放起来
      roleId:'',


    }
  },
  //钩子函数created
  created() {
    //页面还没有渲染,但是data和methods可以使用
    //调用获取数据列表的函数,
    this.getRolesList()
  },
  methods: {
    //获取所有角色列表
    async getRolesList() {
      //发送请求,获取数据
      const { data: res } = await this.$http.get('roles')
      //   console.log(res)
      // 把获取到的数据赋值给data中存放数据的数组
      this.rolelist = res.data
    },
    //删除角色标签
    async removeRightById(role, rid) {
      //弹框删除用户信息
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      //如果返回结果是confirm,则是点击确定,
      // console.log(confirmResult)
      if (confirmResult !== 'confirm') return this.$message.info('取消删除')
      //否则点击确认删除
      //发送请求
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rid}`
      )
      // console.log(res)
      //根据返回来的结果进行判断
      if (res.meta.status !== 200)
        return this.$message.error('取消角色权限失败')
      //否则删除成功
      // 然后不让列表刷新使当前折叠栏合起来
      //直接给当前删除的数据重新赋值新数据 由于双向数据绑定,点击删除,页面也会删除
      role.children = res.data
    },
    //分配权限事件处理函数  把数据参数传递过来
    async showSetRightDialog(role) {
      //先把该项的id保存在定义的roleId中
      this.roleId = role.id

      //发送请求获取分配权限数据
      const { data: res } = await this.$http.get('/rights/tree')
      //把获取到的数据赋值给rightslist
      this.rightslist = res.data
      //调用函数查询出三级权限的id  第一个参数是节点数据,第二个参数是数组
      this.getLeafKeys(role,this.defkeys)

      // console.log(this.rightslist)
      //展示对话框
      this.setRightDialogVisible = true
    },
    //定义函数为了查询到三级的节点id,两个参数,第一个是传入的节点,第二个是存放查询到三级权限的id
    getLeafKeys(node,arr){
      //判断节点中是否有children属性作为判断是否为三级权限的依据,没哟的话就是三级权限
      if(!node.children){
        //是三级权限,就把该id存放在arr数组中
        return arr.push(node.id)
      }
      //如果不是三级权限,就使用递归继续查询
      node.children.forEach(item=>{
        this.getLeafKeys(item,arr)
      })
    },
    // 监听关闭弹出框,关闭的话
    setRightDialogClosed(){
      //把勾选的那个数组清空,方便下一个点击重复
      this.defkeys=[]
    },
    //保存新增的分配权限
 async allotRights(){
    //tree树中自带的方法,需要添加一个ref='treeRef'属性,然后使用方法时,this.$refs.treeRef.方法()   
    //getHalfCheckedKeys()获取半选状态  返回一个数组存放该选中的id,getCheckedKeys()获取全选状态的id
    const keys=[...this.$refs.treeRef.getHalfCheckedKeys(),...this.$refs.treeRef.getCheckedKeys()]
   //把所有选中的角色id数组转换为字符串,由于发送请求的参数是字符串类型
    const kids = keys.join(',')
    // 发送请求,来保存选择的角色权限   传递的参数是该弹出框的那个id,后边参数是字符串
    const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{
      rids:kids
    })
    console.log(res)
    //判断是否保存成功
    if(res.meta.status !==200) return this.$message.error('分配权限失败')
    //成功时,显示成功,并刷新列表
    this.$message.success(res.meta.msg)
    //刷新数据
    this.getRolesList()
    //关闭显示隐藏框
    this.setRightDialogVisible = false
  }
  }
}
</script>

<style lang="less" scoped>
// 顶部边框线
.tb {
  border-top: 1px solid #eee;
}

//底部边框线
.bb {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
.el-tag {
  margin: 7px;
}
</style>
