<template>
<div>
      <!-- 面包屑导航 -->
     <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>订单管理</el-breadcrumb-item>
        <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
     <!-- 卡片视图 -->
    <el-card class="box-card">
        <el-row>
            <el-col :span="8">
            <el-input placeholder="请输入内容">
                <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
            </el-col>
        </el-row>

        <el-table style="width: 100%" border :data="orderlist" stripe>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="create_time"></el-table-column>
                <el-table-column label="订单价格" prop="order_price"></el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                    <template slot-scope="scope">
                        <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
                        <el-tag type="danger" v-else>未付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send">
                    <template slot-scope="scope">
                        {{scope.row.is_send}}
                    </template>
                </el-table-column>
                <el-table-column label="下单时间" prop="create_time">
                   <template slot-scope="scope">
                       {{scope.row.create_time | dateFormat}}
                   </template>
                </el-table-column>
                <el-table-column label="操作" prop="">
                    <template>
                        <el-button size="mini" type="primary" icon="el-icon-edit" @click="showBox"></el-button>
                        <el-button size="mini" type="success" icon="el-icon-location" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
        </el-table>
       <!-- 分页数据 -->
            <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[10, 20, 30, 50]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
            </el-pagination>

    </el-card>
    <!-- 弹出对话框 -->
       <el-dialog title="修改地址" :visible.sync="addressVisible" width="50%" @close="addressDialogClosed">
            <el-form :model="addressForm" :rules="addressFormRules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader :options="cityData" v-model="addressForm.address1"></el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressVisible = false">确 定</el-button>
            </span>
       </el-dialog>

      <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline>
        <el-timeline-item v-for="(activity, index) in progressInfo" :key="index" :timestamp="activity.time">
          {{activity.context}}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
</div>
</template>

<script>
import cityData from './citydata.js'
export default {
    data(){
        return {
            //参数列表数据
            queryInfo:{
                query:'',
                pagesize:10,
                pagenum:1
            },
            //订单总数
            total:0,
            //商品列表存放
            orderlist:[],
            addressVisible:false,
            //添加分类表单数据
            addressForm:{
                address1:[],
                address2:''
            },
             addressFormRules: {
                address1: [
                    { required: true, message: '请选择省市区县', trigger: 'blur' }
                ],
                address2: [
                    { required: true, message: '请填写详细地址', trigger: 'blur' }
                ]
            },
            cityData,
            progressVisible: false,
            progressInfo: []
        }
    },
    created(){
        //调用函数可以获取列表数据
        this.getOrderList()
    },
    methods:{
      async  getOrderList(){
            //发送请求
            const {data:res} = await this.$http.get('orders',{params:this.queryInfo})
            // console.log(res)
            //判断是否获取成功
            if(res.meta.status !== 200) return this.$message.error('订单获取失败')
            //获取成功
            this.$message.success('订单获取成功')
            //把数据赋值给orderlist,用来渲染页面
            this.orderlist = res.data.goods
            //订单总数
            this.total = res.data.total
        },
        //每页多少条
          handleSizeChange(newSize) {
             this.queryInfo.pagesize = newSize
             this.getOrderList()
           },
           //当前页码
         handleCurrentChange(newPage) {
             this.queryInfo.pagenum = newPage
             this.getOrderList()
        },
        //显示对话框
        showBox(){
            this.addressVisible = true
        },
        //展示物流信息
        async showProgressBox(){
          const {data:res} = await this.$http.get('/kuaidi/804909574412544580')

          if(res.meta.status !== 200) {
              return this.$message.error('获取物流进度失败')
          }
          //把获取到的物流信息复制到数组,以供来渲染页面
          this.progressInfo = res.data

          this.progressVisible = true

          console.log(res)
        },
        //关闭对话框时 重置表单
        addressDialogClosed(){
             this.$refs.addressFormRef.resetFields()
        }
  }
}

</script>

<style lang='less' scoped>
@import '../../plugins/timeline/timeline.css';
@import '../../plugins/timeline-item/timeline-item.css';
</style>
