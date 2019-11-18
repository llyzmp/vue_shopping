<template>
<div>
     <!-- 面包屑导航 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <!--  -->
        <el-alert title="注意:只允许第三级分类设置相关参数!" type="warning" show-icon :closable="false">  </el-alert>
         <el-row class="el-jilian">
            <el-col>
                <span>选择商品分类</span>
                 <el-cascader v-model="selectedCateKeys" :options="catelist" 
                 @change="handleChange" :props="cateProps" clearable>

                 </el-cascader>
            </el-col>
        </el-row>
        <!-- tabs栏切换 -->
         <el-tabs v-model="activeName" @tab-click="handleTabClick">
            <el-tab-pane label="动态参数" name="many">
                <el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
                <!-- 动态参数表格 -->
                <el-table style="width: 100%" border :data="manyTableData" stripe >
                    <el-table-column type="expand">
                       <template slot-scope="scope">
                           <!-- 循环渲染 -->
                            <el-tag v-for="(item,i) in scope.row.attr_vals" :key="
                            i" @close="handleClose(i,scope.row)" closable>{{item}}</el-tag>
                            <!-- 输入的文本框 -->
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" 
                                ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" 
                                @blur="handleInputConfirm(scope.row)">
                            </el-input>
                               
                           <!-- 添加按钮 -->
                             <el-button v-else  size="small"  @click="showInput(scope.row)">+ New Tag</el-button>
                       </template>
                    </el-table-column>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)">删除</el-button>
                        </template>
                    </el-table-column>
            
                </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
                <el-button type="primary" :disabled="isBtnDisabled"  @click="addDialogVisible=true">添加属性</el-button>
                <!--静态属性 表格 -->
                <el-table style="width: 100%" border :data="onlyTableData" stripe >
                    <el-table-column type="expand">
                          <template slot-scope="scope">
                           <!-- 循环渲染 -->
                            <el-tag v-for="(item,i) in scope.row.attr_vals" :key="
                            i" @close="handleClose(i,scope.row)" closable>{{item}}</el-tag>
                            <!-- 输入的文本框 -->
                            <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue" 
                                ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)" 
                                @blur="handleInputConfirm(scope.row)">
                            </el-input>
                               
                           <!-- 添加按钮 -->
                             <el-button v-else  size="small"  @click="showInput(scope.row)">+ New Tag</el-button>
                       </template>
                    </el-table-column>
                    <el-table-column type="index"></el-table-column>
                    <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                    <el-table-column label="操作">
                        <template slot-scope="scope">
                            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.attr_id)">修改</el-button>
                            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(scope.row.attr_id)" >删除</el-button>
                        </template>
                    </el-table-column>
            
                </el-table>
            </el-tab-pane>
        </el-tabs>
    </el-card>
    <!-- 点击添加弹出对话框 -->
    <el-dialog :title='"添加"+titleText' :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
        <span>
            <el-form ref="addFormRef" :rules="addFormRules" :model="addForm" label-width="100px">
                <el-form-item prop="attr_name" :label="titleText">
                    <el-input  v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="addParams">确 定</el-button>
       </span>
    </el-dialog>

     <!-- 点击修改弹出对话框 -->
    <el-dialog :title='"修改"+titleText' :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed">
        <span>
            <el-form ref="editFormRef" :rules="editFormRules" :model="editForm" label-width="100px">
                <el-form-item prop="attr_name" :label="titleText">
                    <el-input  v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
        </span>
        <span slot="footer" class="dialog-footer">
            <el-button @click="editDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editParams">确 定</el-button>
       </span>
    </el-dialog>

</div>

</template>

<script>
export default {
    data:function(){
        return {
            //级联选择器的数据列表
            catelist:[],
            //存放的是选择的级联的id数组
            selectedCateKeys:[],
            //级联选择器配置属性
            cateProps:{
                label:'cat_name',
                value:'cat_id',
                children:'children'
            },
            //tab栏被激活的那一项的name
            activeName:'many',
           //动态参数存放数据
            manyTableData:[],
           //静态属性存放的数据
           onlyTableData:[],
           //显示隐藏对话框
           addDialogVisible:false,
             // 添加表单的验证规则对象
           addFormRules: {
                attr_name: [
                { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            //添加表单验证规则对象
            addForm:{
                attr_name:''
            },
            //编辑对话框显示与隐藏
            editDialogVisible:false,
            //编辑规则
            editFormRules:{
                 attr_name: [
                     { required: true, message: '请输入参数名称', trigger: 'blur' }
                 ]
            },
            //编辑表单对象
            editForm:'',
        }
    },
    created:function(){
       this.getCateList()

    },
    methods:{
        //获取商品分类列表
       async getCateList(){
            //发送请求
            const {data:res} = await this.$http.get('categories')
            // console.log(res)
            //判断是否获取成功
            //获取失败
            if(res.meta.status !== 200) return this.$message.error('商品分类列表获取失败')
            //获取成功
            this.$message.success(res.meta.msg)
            //把数据存放在数组中,以供使用
            this.catelist = res.data
        },
        //级联选择器改变时触发
        handleChange(){
            //调用该函数,判断是不是选中三级分类
            this.getParamsData()
        },
        //判断是不是选中三级分类
       async getParamsData(){
            if(this.selectedCateKeys.length !== 3){
                // 清空数组中存放选中的分类id
                this.selectedCateKeys = []
                // console.log(this.selectedCateKeys)
                //没有选中三级分类 把动态和静态数据清空,避免没有选中分类,下边也渲染出页面
                this.manyTableData = []
                this.onlyTableData = []
                return
            }
            //发送请求获取分类参数列表
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,{
                params:{sel:this.activeName}
            })
            // console.log(res)
            // 把商品展示的数据,切割成数组,然后循环遍历取出来展示
             res.data.forEach(item=>{
                item.attr_vals = item.attr_vals ? item.attr_vals.split(' '):[]
                 // 添加一个属性控制输入文本框的显示与隐藏
                item.inputVisible = false
                 //添加一个属性,保存文本框中输入的值
                item.inputValue = ''
               
            })
            //如果是动态参数
            if(this.activeName === 'many'){
                this.manyTableData = res.data
            }else{
                this.onlyTableData = res.data
            }
           
        //    console.log(res.data)
        },
        //tab栏选中时触发
        handleTabClick(){
            //切换tab栏是也判断一下是否选中为三级分类,发送请求获取数据
            this.getParamsData()
        },
        //点击确认提交
        addParams(){
            //验证表单,然后发送请求
            this.$refs.addFormRef.validate(async valid=>{
                //如果验证不通过,终止
                if(!valid) return 
                //发送请求,
                const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`,{
                       attr_name: this.addForm.attr_name,
                       attr_sel: this.activeName
                })
                // console.log(res)
                //如果不成功
                if(res.meta.status !== 201) this.$message.error('添加失败')
                //成功 
                this.$message.success(res.meta.msg)
                //  刷新列表
                this.getParamsData() 
                  //点击确认关闭弹出框
                this.addDialogVisible = false
            })
               
          
        },
        // 关闭对话框是时从重置表单
        addDialogClosed(){
            this.$refs.addFormRef.resetFields()
        },
        //点击修改按钮
       async showEditDialog(id){
            //发送请求
            const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`, {
                 params: { attr_sel: this.activeName }
             })
            // console.log(res)
            if(res.meta.status !== 200) return this.$message.error('获取参数信息失败')
            
            this.editForm = res.data
            //显示修改对话框    
            this.editDialogVisible = true
        },
        //确定按钮事件
        editParams(){
            //先验证在发送请求
            this.$refs.editFormRef.validate(async valid=>{
                //验证不通过 终止
                if(!valid) return  
                // 验证通过 发送请求
                const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
                   { attr_name:this.editForm.attr_name, attr_sel: this.activeName }
                )
                console.log(res)
                //判断是否更新成功
                if(res.meta.status !== 200) return this.$message.error('修改失败')
                //修改成功  刷新列表
                this.getParamsData()

                 //显示修改对话框    
                 this.editDialogVisible = false
            })
        },
        //编辑对话框关闭事件
        editDialogClosed(){
             this.$refs.editFormRef.resetFields()
        },
        //点击删除该参数或属性
        async  removeParams(id){
            // 点击删除,是否确认  
             const confirmResult = await this.$confirm(
                '此操作将永久删除该参数, 是否继续?',
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            ).catch(err => err)
              //判断是否点击的是确定或者取消
              if(confirmResult !== 'confirm'){
                  //用户点击了取消
                  return this.$message.error('取消删除')
              }
              //用户点击确定删除 发送请求
              const {data:res} = await this.$http.delete(`categories/${this.cateId}/attributes/${id}`)
              console.log(res)
             //判断请求是否成功
             if(res.meta.status !== 200) return this.$message.error('删除失败')
             //删除成功 
             this.$message.success('删除成功')
            //刷新列表
             this.getParamsData()  
         },
         //点击回车或者失去焦点触发事件
         handleInputConfirm(row){
            //   console.log(row)
             //判断是否输入内容
            if(row.inputValue.trim().length === 0){
                //把数据清空
                row.inputValue = ''
                //把文本框隐藏,按钮显示出来
                 row.inputVisible = false
                 return
            }
            //如果输入内容,就把内容添加到数组中
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            //发送请求,保存到数据库中
            /***************************** */
            this.saveAttrVals(row)

         } ,
         //新增的标签保存到数据库中
        async saveAttrVals(row){
            //  console.log(row)
             //发送请求
             const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                 attr_name:row.attr_name,
                 attr_sel:row.attr_sel,
                 attr_vals:row.attr_vals.join(' ')
             })
            //  console.log(res)
             //判断是否成功
             if(res.meta.status !== 200) return this.$message.error('更新失败')
             //更新成功
             this.$message.success('更新成功')
         },
         //点击小叉号删除标签
         handleClose(i,row){
             //点击删除,把数组中的数据删除一个
             row.attr_vals.splice(i,1)
             //删除后,保存数据库
             this.saveAttrVals(row)
         },
         //点击按钮切换为输入文本框
         showInput(row){
             //把判断显示文本框条件为true,才能显示
             row.inputVisible = true
             //让文本框自动获得焦点,
             //$nextTick方法的作用就是当页面上元素被重新渲染之后,才会指定回调函数中的代码
             this.$nextTick(_ =>{
                 this.$refs.saveTagInput.$refs.input.focus()
             })
         }
    },
    //计算属性
    computed:{
        //按钮被禁用就返回true,否则false
        isBtnDisabled(){
            if(this.selectedCateKeys.length !== 3){
                return true
            }
            return false
        },
        //获取三级分类的id
        cateId(){
            if(this.selectedCateKeys.length !== 3){
                return null
            }
            //所属分类为三级的话,返回三级分类,发送请求,传参用
            return this.selectedCateKeys[2]
        },
        //判断是动态参数还是静态属性,来动态更换对话框title
        titleText(){
            if(this.activeName === 'many'){
                return '动态参数'
            }
            return '静态属性'
        },
    }
}
</script>

<style lang="less" scoped>
.el-alert {
    margin-top: 20px;
}
.el-jilian {
    margin-top: 30px;
}
.el-cascader {
    margin-left: 10px;
}
.el-tabs {
    margin-top: 30px;
}
.el-tag {
    margin: 10px;
}
.input-new-tag {
    width: 120px;
}
</style>