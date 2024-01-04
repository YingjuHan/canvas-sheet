<template>
  <div id="app">
    <div id="data-grid-demo"></div>
    <div style="padding: 12px 0;">
      <el-button size="small" @click="getData">获取数据</el-button>
      <el-button size="small" @click="updateData">更新行数据</el-button>
      <el-button size="small" @click="getCheckedRows">获取选中行数据</el-button>
      <el-button size="small" @click="getChangedRows">获取已改变行数据</el-button>
      <el-button size="small" @click="getValidations">获取校验结果</el-button>
      <el-button size="small" @click="setValidations">设置校验结果</el-button>
      <el-button size="small" @click="clearValidations">清空校验结果</el-button>
      <el-button size="small" @click="setFullScreen">
        {{ !isFullscreen ? "全屏" : "退出全屏" }}
      </el-button>
    </div>
    <DataGrid
      ref="datagridRef"
      :columns="columns"
      :data="gridData"
      :fixed-left="2"
      :fixed-right="1"
      @after-edit-cell="afterEditCell"
      @after-autofill="afterAutofill"
      @after-paste="afterPaste"
      @after-clear="afterClear">
    </DataGrid>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DataGrid from './components/DataGrid/index.vue';
const datagridRef = ref();
const isFullscreen = ref(false);
const gridData = ref<Array<any>>([]);
const columns = ref<Array<any>>([]);

function setFullScreen() {
  let el = document.getElementById("app") as HTMLElement;
  if (!isFullscreen.value) {
    isFullscreen.value = true;
    el.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      min-height: 100vh;
      background: #fff;
      z-index: 2000;
      overflow: hidden;
    `;
  } else {
    isFullscreen.value = false;
    el.style.cssText = `position: relative;`;
  }
  
  datagridRef.value.setFullScreen();
}

function getData() {
  const data = datagridRef.value.getData();
};
function updateData() {
  const data = [
    {
      id: 1,
      'emp_name': '数据111',
      'emp_no': '数据222'
    },
    {
      id: 3,
      'job_name': '数据333',
      'emp_no': '数据444'
    }
  ];
  datagridRef.value.updateData(data);
};
function afterEditCell(data: any) {
  console.log(data)
};
function afterAutofill(data: any) {
  console.log(data)
};
function afterPaste(data: any) {
  console.log(data)
};
function afterClear(data: any) {
  console.log(data)
};
function getCheckedRows() {
  const data = datagridRef.value.getCheckedRows();
  console.log(data);
  alert("获取成功，请查看控制台");
};
function getChangedRows() {
  const data = datagridRef.value.getChangedRows();
  console.log(data);
  alert("获取成功，请查看控制台");
};
function getValidations() {
  const data = datagridRef.value.getValidations();
  console.log(data);
  alert("获取成功，请查看控制台");
};
function setValidations() {
  const errors = [
    {
      id: 1,
      'emp_name': '错误111',
      'emp_no': '错误222'
    },
    {
      id: 3,
      'job_name': '错误333',
      'emp_no': '错误444'
    }
  ];
  datagridRef.value.setValidations(errors);
};
function clearValidations() {
  datagridRef.value.clearValidations();
};

const columnsValue = [
  { title: "姓名", key: "emp_name" },
  { title: "工号", key: "emp_no", type: 'number' },
  {
    title: "部门",
    key: "dep_name",
    size: "small",
    align: "left",
    readonly: true
  },
  {
    title: "岗位",
    key: "job_name",
    size: "small",
    align: "left",
    rule: {
      required: true,
      validator: function (value: string, row: any, callback: any) {
        if (value.length > 10) {
          callback('岗位字段长度必须小于10个字符哦！')
        } else if (value.length < 1) {
          callback('岗位字段长度必须填哦！')
        } else {
          callback()
        }
      },
      immediate: false
    }
  },
  { title: "手机号", key: "phone", type: "phone" },
  {
    title: "配送信息",
    key: "delivery_info",
  },
  {
    title: "性别",
    key: "sex",
    type: "select",
    options: [
      { value: 1, label: "男" },
      { value: 2, label: "女" }
    ],
    rule: {
      required: true
    }
  },
  {
    title: "计薪月份",
    size: "small",
    key: "salary_month",
    type: "month",
    align: "center"
  },
  { title: "出生日期", size: "small", key: "birthday", type: "date" },
  {
    title: "家庭地址",
    key: "address",
    size: "medium",
    align: "left",
    rule: {
      required: true,
      message: "该项必填哦！"
    }
  },
  {
    title: "请假开始时间",
    size: "small",
    key: "start_dt",
    type: "datetime"
  },
  {
    title: "物料编码",
    key: "materialNo",
    align: "right",
    render: function (val: string) {
      const v = parseFloat(val);
      return v.toFixed(2);
    }
  },
  {
    title: "数量",
    key: "requiredQuantity",
    type: "number",
    align: "right",
    rule: {
      message: "请输入数字，且不能超过2为小数！"
    }
  },
  { title: "单位", key: "unit" },
  { title: "工作性质", key: "work_type" },
  { title: "工作状态", key: "work_status" },
  { title: "户籍城市", key: "household_city" },
  { title: "户籍地址", key: "household_address" },
  { title: "民族", key: "nation" },
  { title: "工作地址", size: "small", key: "work_address" },
  { title: "工作邮箱", size: "small", key: "work_email" },
  { title: "个人邮箱", size: "small", key: "email" },
  { title: "工龄", key: "work_age" },
  { title: "司龄", key: "company_age" },
  { title: "合同公司", size: "small", key: "contract_company" },
  { title: "qq号", key: "qq" },
  { title: "年龄", key: "age" },
  { title: "品牌", key: "brandName" },
  { title: "商品名称", key: "goodsName" },
  { title: "规格型号", key: "sn" },
  { title: "客户备注", key: "customerRemarks", size: "small" },
  {
    title: "采购价(元)",
    key: "purchasePrice",
    type: "number"
  },
  { title: "销售价(元)", key: "salePrice", type: "number", size: "small" }
];
let data = [];
for (let i = 0; i < 10000; i += 1) {
  data.push({
    id: i,
    emp_name: `张三${i}`,
    emp_no: 10 + i,
    dep_name: i === 4 ? null : `研发部${i}`,
    job_name: i === 5 ? "产品经理测试很长的名字" : `产品经理${i}`,
    phone: i === 4 ? "13159645561a" : `${13159645561 + i}`,
    sex: i % 4 === 0 ? 1 : i === 3 ? null : 2,
    address:
      i === 1
        ? `海淀区北京路海淀区北京路十分地${i}号`
        : i === 4
          ? ""
          : `海淀区北京路${i}号`,
    work_type: `兼职${i}`,
    work_status: `在职${i}`,
    household_city: `深圳${i}`,
    household_address: `深南大道${i}号`,
    nation: `汉${i}`,
    work_address: `南京路${i}号`,
    work_email: `${28976633 + i}@qq.com`,
    email: `${4465566 + i}@qq.com`,
    work_age: 2 + i,
    company_age: 1 + i,
    contract_company: `飞鸟物流公司${i}`,
    qq: 35860567 + i,
    salary_month: `${1996 + i}-09`,
    birthday: `${1996 + i}-09-21`,
    age: 1 + i,
    hobby: "水果/苹果",
    brandName: `博世${i}`,
    goodsName: `电钻${i}`,
    sn: `SDFSD${i}`,
    materialNo: `1231${i}`,
    unit: "个",
    requiredQuantity: 10,
    customerRemarks: `测试测试${i}`,
    purchasePrice: 10.2 + i,
    salePrice: 12.3 + i,
    delivery_name: `王麻子${i}`,
    delivery_address: `民族大道${i}号`,
    province: `湖北省${i}`
  });
}
columns.value = columnsValue;
gridData.value = data;
</script>



<style lang="css">
body {
  margin: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  padding: 0;
  margin: 0;
}
</style>
