<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table style="width: 100%" border :data="userlist" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <!-- 放一个开关 -->
            <!-- {{scope.row}} -->
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              circle
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              circle
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                circle
                :enterable="false"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页数据 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="30%"
      @close="addDialogClosed"
    >
      <el-form
        label-width="70px"
        :rules="addFormRules"
        ref="addFormRef"
        :model="addForm"
      >
        <!-- 表单信息  用户名,密码, 邮箱,手机 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户信息 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="30%"
      @close="editDialogClosed"
    >
      <el-form
        label-width="70px"
        :rules="editFormRules"
        ref="editFormRef"
        :model="editForm"
      >
        <!-- 表单信息  用户名,密码, 邮箱,手机 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色弹出框 -->
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" @close="setRoleDialogClosed">
      <span>
        <p>当前用户:{{ userInfo.username }}</p>
        <p>当前角色:{{ userInfo.role_name }}</p>
        <p>
          分配新角色:
          <template>
            <!-- 把选中的那一个id值通过:value传给v-model在传给selectRoleId -->
            <el-select v-model="selectedRoleId" placeholder="请选择">
              <el-option
                v-for="item in roleslist"
                :key="item.id"
                :label="item.roleName"
                :value="item.id"
              >
              </el-option>
            </el-select>
          </template>
        </p>
      </span>
      <span slot="footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo()">确 定</el-button >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }

    return {
      // 获取用户列表参数对象
      queryInfo: {
        // 查询参数
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 5
      },
      // 用户列表数据
      userlist: [],
      // 数据总条数
      total: 0,
      // 显示隐藏添加用户栏
      addDialogVisible: false,
      // 添加数据对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 验证规则
      addFormRules: {
        // username验证规则  triggle="blur" 失去焦点时验证
        username: [
          {
            required: true,
            message: '请输入用户名',
            triggle: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名长度在3-10个字符之间',
            triggle: 'blur'
          }
        ],
        // 密码验证
        password: [
          {
            required: true,
            message: '请输入密码',
            triggle: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '用户名长度在6-15个字符之间',
            triggle: 'blur'
          }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // 邮箱自定义验证规则使用validator
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 修改显示隐藏框的属性值
      editDialogVisible: false,
      // 修改用户的存放数据
      editForm: {},
      // 修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入用户邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入用户手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 分配角色显示隐藏框
      setRoleDialogVisible: false,
      // 存放用户角色信息
      userInfo: {},
      // 获取到角色列表
      roleslist: [],
      // 选中的id
      selectedRoleId: ''
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      // console.log(res)
      // 如果登录不成功
      if (res.meta.status !== 200) {
        return this.$message.error('用户列表获取失败')
      }
      // 把数据填充到userlist数组中
      this.userlist = res.data.users
      // /获取数据总条数
      this.total = res.data.total
      // console.log(this.userlist)
    },
    // 监听事件每页多少条  监听pagesize改变事件
    handleSizeChange (newSize) {
      // 新变更的每页多少条
      // console.log(newSize)
      // 赋值给数据表中更新数据
      this.queryInfo.pagesize = newSize
      // 刷新页面数据
      this.getUserList()
    },
    // 当前页码
    handleCurrentChange (newPage) {
      // 打印当前选择的新页码
      // console.log(newPage)
      // 把新页码值替换旧页码
      this.queryInfo.pagenum = newPage
      // 刷新页面数据
      this.getUserList()
    },
    // 监听switch开关状态
    async userStateChanged (val) {
      // console.log(val)
      // 发送请求  异步请求
      const { data: res } = await this.$http.put(
        `users/${val.id}/state/${val.mg_state}`
      )
      console.log(res)
      // 判断是否发送请求成功
      if (res.meta.status !== 200) {
        // 发送失败把状态更改回原来状态
        val.mg_state = !val.mg_state
        this.$message.error('状态设置失败')
        return
      }
      this.$message.success(res.meta.msg)
    },
    // 添加用户关闭的时候,重置表单数据,清空
    addDialogClosed () {
      // 实例对象下边的$ref属性,的addFormRef调用方法resetFields()
      // console.log(this)
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser () {
      // 验证表单是否符合
      this.$refs.addFormRef.validate(async valid => {
        // 验证成功返回一个true  如果不通过,停止下边代码
        if (!valid) return
        // 通过验证后,发送请求
        const { data: res } = await this.$http.post('users', this.addForm)
        // console.log(res)
        if (res.meta.status !== 201) return this.$message.error('添加用户失败')
        // 否则添加用户成功
        this.$message.success(res.meta.msg)
        // 隐藏弹出框,
        this.addDialogVisible = false
        // 刷新用户列表
        this.getUserList()
      })
    },
    // 修改用户信息
    async showEditDialog (id) {
      console.log(id)
      // 发送请求,
      const { data: res } = await this.$http.get('users/' + id)
      // console.log(res)
      if (res.meta.status !== 200) { return this.$message.error('查询用户信息失败！') }

      // 否则把数据赋值给上边定义的空对象接收,来展示在页面中
      this.editForm = res.data
      // 点击修改按钮,显示修改框
      this.editDialogVisible = true
    },
    // 修改用户弹出框关闭时,重置表单
    editDialogClosed () {
      this.$refs.editFormRef.resetFields()
    },
    // 点击确定,进行验证,验证通过发送请求
    editUserInfo () {
      // 对表单修改的数据进行验证  通过的话发送请求
      this.$refs.editFormRef.validate(async valid => {
        // 如果不通过
        if (!valid) return
        // 通过  发送请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        // console.log(res)
        // 更新失败
        if (res.meta.status !== 200) { return this.$message.error('用户信息更新失败') }
        // 更新成功
        this.$message.success(res.meta.msg)
        // 点击确定提交时,关闭修改框
        this.editDialogVisible = false
        // 刷新列表1
        this.getUserList()
      })
    },
    // 点击删除用户信息
    async removeUserById (id) {
      // 弹框删除用户信息
      const confirmResult = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果确认删除,成功的话就会返回confirm字符串
      // console.log(confirmResult)
      // 判断是否确认删除
      if (confirmResult !== 'confirm') {
        return (this.$message.info = '取消删除用户')
      }
      // 确认删除就发送请求
      const { data: res } = await this.$http.delete('users/' + id)
      // console.log(res);
      // 判断是否删除成功
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      // 删除用户成功
      this.$message.success(res.meta.msg)
      // 删除用户后,重新刷新页面数据
      this.getUserList()
    },
    // 分配角色事件
    async setRole (info) {
      // 把用户信息存放在userInfo
      this.userInfo = info
      // console.log(info);

      // 发送请求获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      // console.log(res)
      // 判断是否获取成功
      if (res.meta.status !== 200) { return this.$message.error('获取角色列表失败') }
      // 获取成功的话,赋值给上边角色列表数组
      this.roleslist = res.data
      // 点击分配角色,弹出框
      this.setRoleDialogVisible = true
    },
    // 点击保存新增的角色,事件函数
    async  saveRoleInfo () {
      // console.log(this.selectedRoleId)
      // 判断是否选中角色
      if (!this.selectedRoleId) return this.$message.error('请先选择角色')

      // 选择角色后 发送请求,来保存选择的角色
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      // console.log(res)
      // 判断是否保存成功
      if (res.meta.status !== 200) return this.$message.error('角色保存失败')
      // 否则保存成功
      this.$message.success('角色保存成功')

      // 关闭显示框
      this.setRoleDialogVisible = false
    },
    // 监听关闭消息框事件
    setRoleDialogClosed () {
    // 把选择的角色清空
      this.selectedRoleId = ''
      // 把userInfo清空
      this.userInfo = {}
    }

  }
}
</script>

<style lang="less" scoped></style>
