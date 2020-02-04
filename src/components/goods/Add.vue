<template>
    <div>
    <!-- 面包屑导航 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
        <!-- 提示信息 -->
        <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
        <!-- 进度条 -->
        <el-steps :active="activeIndex - 0" align-center >
            <el-step title="基本信息"></el-step>
            <el-step title="商品参数"></el-step>
            <el-step title="商品属性"></el-step>
            <el-step title="商品图片"></el-step>
            <el-step title="商品内容"></el-step>
            <el-step title="完成"></el-step>
        </el-steps>

        <!-- tab栏 -->
        <el-form :model="addForm" status-icon :rules="addFormRules"
            ref="addFormRef" label-width="100px" :label-position="'top'">
            <el-tabs v-model="activeIndex"  :tab-position="'left'" :before-leave="beforeTabLeave" @tab-click="tabClicked">
                <el-tab-pane label="基本信息" name = '0'>
                    <el-form-item label="商品名称" prop="goods_name">
                        <el-input  v-model="addForm.goods_name"></el-input>
                    </el-form-item>
                    <el-form-item label="商品价格" prop="goods_price">
                        <el-input v-model="addForm.goods_price" ></el-input>
                    </el-form-item>
                    <el-form-item label="商品数量" prop="goods_number">
                        <el-input v-model.number="addForm.goods_number"></el-input>
                    </el-form-item>
                    <el-form-item label="商品重量" prop="goods_weight">
                        <el-input v-model.number="addForm.goods_weight"></el-input>
                    </el-form-item>
                   <el-form-item label="商品分类" prop="goods_cat">
                        <el-cascader v-model="addForm.goods_cat" :options="parentCateList" :props="cascaderProps"
                                 @change="parentCateChanged" clearable expand-trigger="hover">
                        </el-cascader>
                   </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品参数" name = '1'>
                    <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id"> 
                        <el-checkbox-group v-model="item.attr_vals" size="small">
                            <el-checkbox :label="item1" border  v-for="(item1,index) in item.attr_vals" :key="index"></el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>      
                </el-tab-pane>
                <el-tab-pane label="商品属性" name = '2'>
                   <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">     
                       <el-input v-model="item.attr_vals"></el-input>
                   </el-form-item>
                </el-tab-pane>
                <el-tab-pane label="商品图片" name = '3'>
                    <!-- action要上传后台api地址 -->
                    <el-upload :action="uploadURL" :on-preview="handlePreview" 
                    :on-remove="handleRemove" list-type="picture" :on-success="handleSuccess"  :headers="headerObj">
                        <el-button size="small" type="primary">点击上传</el-button>
                    </el-upload>
                </el-tab-pane>
                <el-tab-pane label="商品内容" name = '4'>
                    <!-- 富文本编辑器组件 -->
                    <quill-editor v-model='addForm.goods_introduce' class="ql-editor"></quill-editor>
                    <el-button type='primary' class="btnAdd" @click="add">添加商品</el-button>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </el-card>

    <!-- 图片预览 -->
    <el-dialog title="图片预览" :visible.sync= "previewVisible" width="50%">
        <img :src="previewPath" alt="" class="previewImg">
    </el-dialog>
    </div>

</template>

<script>
import _ from 'lodash'

    export default {
        data () {
            return {
                //保存激活的状态
                activeIndex: '0',
                //添加商品表单数据
                addForm:{
                    //商品名称
                    goods_name:'',
                    //以','分割的分类列表
                    goods_cat:[],
                    //价格
                    goods_price:0,
                    //数量
                    goods_number:0,
                    //重量
                    goods_weight:0,
                    // 图片的数组
                    pics: [],
                    // 商品的详情描述
                    goods_introduce: '',
                    attrs: []
                },
                //验证规则
                addFormRules:{
                    goods_name: [
                            { required: true, message: '请输入商品名称', trigger: 'blur' }
                        ],
                        goods_price: [
                            { required: true, message: '请输入商品价格', trigger: 'blur' }
                        ],
                        goods_weight: [
                            { required: true, message: '请输入商品重量', trigger: 'blur' }
                        ],
                        goods_number: [
                            { required: true, message: '请输入商品数量', trigger: 'blur' }
                        ],
                        goods_cat: [
                            { required: true, message: '请选择商品分类', trigger: 'blur' }
                        ]
                },
                //级联选择器配置对象
                cascaderProps:{
                   value:'cat_id',
                   label:'cat_name',
                   children:'children'
                },
                //级联选择器的数据列表
                parentCateList:[],
                //存放动态参数
                manyTabData:[],
                //静态参数
                onlyTabData:[],
                 // 上传图片的URL地址
                uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
                // 图片上传组件的headers请求头对象
                headerObj: {
                    Authorization: window.sessionStorage.getItem('token')
                },
                previewPath: '',
                previewVisible: false
            }
        } ,
        created() {
            //当实例创建完成,数据和方法可以使用时,调用获取级联选择器列表数据
             this.getCateList()
        },
        methods:{
            //获取级联选择器的列表数据
           async  getCateList(){
               const { data : res } = await this.$http.get('categories')
            //    console.log(res)
               //判断请求是否发送成功
               if(res.meta.status !== 200) return this.$message.error('数据获取失败')
               //获取成功
               this.$message.success('列表数据获取成功')
               //把获取到的数据赋值给parentCateList数组
               this.parentCateList = res.data
            },
            //级联选择器选择时触发
            parentCateChanged(){
                // console.log(this.addForm.goods_cat)
                //只让选中第三级商品,通过判断父类id的数组长度是否为3来判断是否选中三级商品
                if(this.addForm.goods_cat.length !== 3){
                    //清空
                    this.addForm.goods_cat = []
                }
            },
            //离开和进入的tabs函数
            beforeTabLeave(activeName,oldactiveName){
                // //activeName离开的tab的状态名字
                // console.log(activeName)
                // //oldactiveName进入的tab的状态名字
                // console.log(oldactiveName)
                //判断商品分类是否选中
                if(this.addForm.goods_cat.length !== 3 && oldactiveName === '0'){
                    this.$message.error('请先选择商品分类')
                    return false
                }
            },
           async tabClicked(){
                //判断切换到商品参数栏
                if(this.activeIndex === '1') {
                   //发送请求,获取数据
                    const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,
                       {
                            params:{sel:'many'}
                       }
                    )
                    // console.log(res)
                    //把展示的参数由字符串切割为数组用来展示
                    res.data.forEach(item=>{
                        item.attr_vals =  item.attr_vals.length == 0 ? []:item.attr_vals.split(',')
                    })
                    //把获取到的数据存放在数组中
                    this.manyTabData = res.data
                }else if (this.activeIndex === '2'){

                    //发送请求获取数据
                     //发送请求,获取数据
                    const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`,
                       {
                            params:{sel:'only'}
                       }
                    )
                    //  console.log(res)
                    //判断是否获取成功
                    if(res.meta.status !== 200) return this.$message.error('静态属性获取失败')
                    //获取成功
                    this.$message.success('静态属性获取成功')
                    //把获取到的数据赋值给onlyTabData数组
                    this.onlyTabData = res.data
                }
            },
            //点击预览函数
            handlePreview(file){
                // console.log(file)
                //预览时是全路径,不是临时路径
                this.previewPath = file.response.data.url
                //把弹出框显示
                this.previewVisible = true
            },
            //点击删除图片
            handleRemove(file){
                // console.log(file)
                //1.获取将要删除的图片的临时路径
                const filePath = file.response.data.tmp_path
                // console.log( this.addForm.pics)
                //2.从pics数组中找到这个图片对应的索引值
                const i = this.addForm.pics.findIndex(x=>x.pic === filePath )
                //3.调用数组的splice方法,把图片信息对象,从pic数组中删除
                this.addForm.pics.splice(i,1)

            },
            //上传成功触发的函数
            handleSuccess(response){
                // console.log(response)
                //拼接得到的一个图片对象
                const picInfo = {pic:response.data.tmp_path}
                //将图片信息对象push到pics数组中
                this.addForm.pics.push(picInfo)
                console.log(this.addForm)
            },
             // 添加商品
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项！')
        }
        // 执行添加的业务逻辑
        // lodash   cloneDeep(obj)
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数
        this.manyTabData.forEach(item => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTabData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        console.log(form)

        // 发起请求添加商品
        // 商品的名称，必须是唯一的
        const { data: res } = await this.$http.post('goods', form)

        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败！')
        }

        this.$message.success('添加商品成功！')
        this.$router.push('/goods')
      })
    }
        },
        //计算属性
        computed:{
            //保存选中的分类商品的id,以供发送请求使用
            cateId(){
                if(this.addForm.goods_cat.length === 3){
                    return this.addForm.goods_cat[2]
                }
            }
        }
    }
</script>

<style lang='less' scoped>
    .el-steps {
        margin: 30px 0;
    }
    .el-checkbox {
        margin: 0 10px 0 0 !important;
    }
    .previewImg {
        width: 100%;
    }
    .btnAdd {
        margin-top: 15px;
    }

</style>