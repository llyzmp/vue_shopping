<template>
<div>
    <!-- 面包屑导航 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
      <el-card class="box-card">
            <!-- 添加一个按钮  -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog()">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
             <!-- 树状表格   -->
        <!-- columns 表格各列的配置    :expand-type="false" 关掉前边展开行    :selection-type="false" 关掉多选复选框
            show-index 显示索引 :show-row-hover="false" 鼠标悬停时，是否高亮当前行
        -->
        <tree-table :data="catelist" :columns="columns"  :expand-type="false"
         :selection-type="false"  show-index index-text="#" border :show-row-hover="false">
            <!-- 自定义模板列 -->
            <!-- 是否有效 -->
            <template slot="isok" slot-scope="scope">
                <!-- {{scope.row}} -->
                <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:lightgreen;"></i>
                <i class="el-icon-error" v-else style="color:red"></i>
            </template>
            <!-- 排序 -->
            <template slot-scope="scope" slot="sort">
                <el-tag v-if="scope.row.cat_level===0">一级</el-tag>
                <el-tag v-else-if="scope.row.cat_level===1" type="success">二级</el-tag>
                <el-tag v-else type="warning">三级</el-tag>
            </template>
            <!-- 编辑和删除按钮 -->
            <template slot="opt" >
                 <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                 <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            </template>
        </tree-table>

        
        <!-- 分页 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
                     :page-sizes="[1, 5, 10, 15]" :page-size="queryInfo.pagesize"
                      layout="total, sizes, prev, pager, next, jumper" :total="total">
       </el-pagination>

      </el-card>

        <!-- 添加分类 -->
        <el-dialog   title="添加分类"  :visible.sync="addCateDialogVisible"  width="30%" @close="addCateDialogClosed">
              <span>
                <el-form :rules="addCateFormRules" label-width="80px" :model="addCateForm" ref="addCateFormRef">
                    <el-form-item label="分类名称" prop="cat_name">
                      <el-input v-model="addCateForm.cat_name"></el-input>
                    </el-form-item>
                    <el-form-item label="父级分类:">
                         <el-cascader expand-trigger="hover" v-model="selectedKeys" :options="parentCateList" 
                         @change="parentCateChanged" :props="cascaderProps"  clearable>

                         </el-cascader>
                    </el-form-item>
               </el-form>
              </span>
              <span slot="footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
              </span>
        </el-dialog>

</div>

</template>

<script>
export default {
  data: function () {
    return {
      // 获取商品分类列表,默认为空
      catelist: [],
      // 发送请求传递参数,当前页码值,每页几条数据,显示几级
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 数据总条数
      total: 0,
      //树状表格列数组属性
      columns:[
         {
             //列标题名称
              label:'分类名称',
              //对应列的属性名
              prop:'cat_name'
         },
         {
             label:'是否有效',
             //列类型，可选值有 'template'(自定义列模板)
             type:'template',
             //列类型为 'template'(自定义列模板) 时，对应的作用域插槽（它可以获取到 row, rowIndex, column, columnIndex）名称
             template:'isok'
         },
         {
             label:'排序',
             type:'template',
             template:'sort'
         },
         {
             label:'操作',
             type:'template',
             template:'opt'
         }
      ],
      //添加分类消息框显示与隐藏
      addCateDialogVisible:false,
    //添加分类的表单数据
    addCateForm:{
      //将要添加的分类名称
      cat_name:'',
      //父级分类ID
      cat_pid:0,
      //分类等级,默认是1级
      cat_level:0
    },
    //验证规则
    addCateFormRules:{
       cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
    },
    //级联选择器数据列表
    parentCateList:[],
    //指定级联选择器的配置对象
    cascaderProps:{
      value:'cat_id',
      label:'cat_name',
      children:'children'
    },
    // 选中的父级的分类ID数组
    selectedKeys:[]

    }
  },
  created: function () {
    // 调用获取列表数据的函数
    this.getCateList()
  },
  methods: {
    // 获取列表数据函数
    async getCateList () {
      // 参数准备好,准备发送请求获取到商品分类的列表数据
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      // console.log(res)
      // 判断是否获取到数据   ,请求是否发送成功
      if (res.meta.status !== 200) return this.$message.error('商品分类列表获取失败')
      // 获取成功
      this.$message.success(res.meta.msg)
      // 把获取到的数据存放在catelist数组中
      this.catelist = res.data.result
      // 打印出来查看一下接收数据是否正确
      // console.log(this.catelist)
      // 把数据总条数赋值给total,做分页数据时要使用
      this.total = res.data.total
    },
    //监听pagesize改变
    handleSizeChange(newSize){
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange(newSize){
      this.queryInfo.pagenum = newSize
       this.getCateList()
    },
    //添加分类
    showAddCateDialog(){

      //获取到级联的数据列表
      this.getParentCateList()
      //显示消息框
      this.addCateDialogVisible=true
    },
    // 获取父级分类数据列表
    async getParentCateList(){
      const {data:res} = await this.$http.get('categories',{params:{type:2}})
      if(res.meta.status !==200) return this.$message.error('获取父级分类列表失败')
      // console.log(res.data)

      this.parentCateList = res.data
   },
   //选择项发生变化,触发这个函数
   parentCateChanged() {
     console.log(this.selectedKeys)
    //判断当前是否选中父级分类,根据选中的父级分类会把父级的id存放在selectedKeys数组中,判断数组长度是否为0
    if(this.selectedKeys.length !==0){
      //给添加的分类加一个父级id
      this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length-1]
      //当前分类添加等级
      this.addCateForm.cat_level = this.selectedKeys.length
    }else{
      // 否则就没有父类,等级为0也就是一级
       this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
    }
   },
   //点击确定添加按钮事件
   addCate(){
     //验证是否通过验证规则
     this.$refs.addCateFormRef.validate(async valid=>{
       //不通过终止
       if(!valid) return 
        // 通过的话
        // 发送请求
        const {data:res} = await this.$http.post('categories',this.addCateForm)
        console.log(res)
        console.log(this.addCateForm)
        // 判断是否添加成功
        if(res.meta.status !== 201) return this.$message.error('添加分类失败')
        //添加分类成功
        this.$message.success(res.meta.msg)
        //刷新列表
        this.getCateList()
         //关闭添加分类框
        this.addCateDialogVisible = false
     })
   },


   //监听关闭对话框
   addCateDialogClosed(){
     //重置表单
     this.$refs.addCateFormRef.resetFields()
     //等级清空
    this.addCateForm.cat_level = 0
     //父类id清空
    this.addCateForm.cat_pid = 0
    //存放选中的父类id数组清空
    this.selectedKeys = []
   }
  }
}

</script>

<style lang="less" scoped>
.el-button {
  margin-bottom: 20px;
}
</style>
