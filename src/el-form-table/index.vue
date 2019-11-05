<template>
  <div>
    <div class="header-title" v-if="titles.length">
      <div class="header-title-item" v-for="(item, index) in titles" :key="index">
        <span class="header-title-label">{{item.label}}</span>
        <span class="header-title-content">{{result[item.key]}}</span>
      </div>
    </div>
    <!-- 搜索 start -->
    <div class="header-form" v-if="formOptions">
      <slot name="formItem"></slot>
      <div class="header-form-item" v-for="(form, index) in formOptions.forms" :key="index">
        <span class="header-form-label">{{form.label}}</span>
        <el-input v-if="form.itemType === 'input' || form.itemType === undefined" v-model="params[form.modelValue]"
          :style="{width: (form.itemWidth || 120) + 'px' }" :size="form.size ? form.size : size"
          :placeholder="form.placeholder">
        </el-input>
        <el-select v-else-if="form.itemType === 'select'" v-model="params[form.modelValue]"
          :size="form.size ? form.size : size" :disabled="form.disabled" :placeholder="form.placeholder"
          :style="{width: (form.itemWidth || 120) + 'px' }">
          <el-option v-for="(option, optionIndex) in form.options" :key="optionIndex + '_local'"
            :value="(typeof option === 'object') ? option[form.valueKey || 'value'] : option"
            :label="(typeof option === 'object') ? option[form.labelKey || 'label'] : option" />
        </el-select>
        <el-date-picker v-else-if="form.itemType === 'date'" v-model="params[form.modelValue]"
          :format="form.format || 'yyyy.MM.dd'" :value-format="form.format || 'yyyy.MM.dd'" type="date"
          :placeholder="form.placeholder" :size="form.size ? form.size : size" :disabled="form.disabled"
          :readonly="form.readonly" :editable="form.editable" :picker-options="form.pickerOptions || {}"
          :style="{width: (form.itemWidth || 240) + 'px' }" />
        <el-date-picker v-else-if="form.itemType === 'daterange'" :format="form.format || 'yyyy.MM.dd'"
          :value-format="form.format || 'yyyy.MM.dd'" v-model="params[form.modelValue]"
          @change="date => changeDate(date, form)" :size="form.size ? form.size : size" type="daterange"
          :disabled="form.disabled" :readonly="form.readonly" :editable="form.editable"
          :range-separator="form.rangeSeparator" :start-placeholder="form.startPlaceholder"
          :end-placeholder="form.endPlaceholder" :picker-options="form.pickerOptions || {}"
          :style="{width: (form.itemWidth || 240) + 'px' }" />
      </div>
      <slot name="formItemEnd"></slot>
      <div class="header-form-item" v-if="!formOptions.closeSearch">
        <el-button size="small" type="primary" icon="el-icon-search" @click="initData">
          搜索
        </el-button>
      </div>
      <div class="header-form-item" v-if="!formOptions.closeDown">
        <el-button class="green" size="small" type="primary" icon="el-icon-download" @click="exportExcel">
          导出EXCEL
        </el-button>
      </div>
      <slot name="formItemButton"></slot>
    </div>
    <!-- 搜索 end -->

    <!-- 表格 start -->
    <el-table v-loading="listLoading" :data="tableData" border fit highlight-current-row style="width: 100%">
      <template v-for=" (column, columnIndex) in columns">
        <el-table-column v-if="column.type === 'index'" :key="columnIndex" :index="indexMethod" v-bind="column"
          align="center">
        </el-table-column>
        <el-table-column v-else-if="column.type" :key="columnIndex" v-bind="column" align="center"></el-table-column>
        <el-table-column v-else :key="columnIndex" :prop="column.prop" :label="column.label" :sortable="column.sortable"
          :width="column.minWidth ? '-' : (column.width || tableColumnWidth)"
          :minWidth="column.minWidth || column.width || tableColumnWidth" align="center">
          <template slot-scope="scope">
            <span v-if="column.render">
              {{ column.render(scope.row) }}
            </span>
            <span v-else>
              {{ scope.row | handleColumn(column.prop) }}
            </span>
          </template>
        </el-table-column>
      </template>
      <slot name="append" />
    </el-table>
    <!-- 表格 end -->

    <!-- 分页 start -->
    <div class="pagination-center">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <!-- 分页 end -->
  </div>
</template>
<script>
export default {
  props: {
    titles: {
      type: Array,
      default: function () {
        return []
      }
    },
    tableColumnWidth: {
      type: Number,
      default: 120
    },
    // 是否需要在created获取数据 默认需要
    initGetList: {
      type: Boolean,
      default: true
    },
    // 搜索表单
    formOptions: {
      type: Object
    },
    // 请求列表参数
    fetchData: {
      type: Object,
      required: true
    },
    // 表格
    columns: {
      type: Array,
      required: true
    },
    // 请求列表参数
    params: {
      type: Object,
      default: function () {
        return {}
      }
    }
  },
  data () {
    return {
      result: {},
      listLoading: false, // 表格loading
      size: 'small', // ui组件大小
      tableData: [], // 表格数据
      total: 0, // 总页数
      currentPage: 1, // 当前页
      pageSize: 10 // 每页数量
    }
  },
  created () {
    // 判断是否需要获取数据
    this.initGetList && this.initData()
  },

  methods: {
    // 时间范围选择器改变
    changeDate (date, form) {
      // 如果date为null,则赋默认值
      if (!date) date = ['', '']
      this.$set(this.params, form.prop[0], date[0])
      this.$set(this.params, form.prop[1], date[1])
    },
    // 获取第一页的数据
    initData () {
      this.currentPage = 1
      this.getList()
    },
    // 请求列表数据
    getList () {
      let requestParams = {}
      let url = this.fetchData.url
      if (!url) return
      let method = this.fetchData.method || 'get'
      method = method.toLowerCase()
      if (method === 'get') {
        url += `?size=${this.pageSize}&current=${this.currentPage}`
        Object.keys(this.params).forEach(key => {
          if (key.indexOf('_') === 0) return
          if (key && this.params[key]) url += `&${key}=${this.params[key]}`
        })
      } else if (method === 'post') {
        requestParams.data = this.fetchData.data
      }
      requestParams.url = url
      requestParams.method = this.fetchData.method
      this.listLoading = true
      this.$axios(requestParams)
        .then(res => {
          this.listLoading = false
          if (res.code === '1000') {
            this.tableData = res.data.content
            this.result = res.data
            this.total = res.data.total
          } else {
            this.$message.error(res.msg || '获取数据失败')
          }
        })
        .catch(() => {
          this.listLoading = false
          this.$message.error('获取数据失败')
        })
    },
    // 改变每页数量
    handleSizeChange (val) {
      this.pageSize = val
      this.getList()
    },
    // 改变当前页号
    handleCurrentChange (val) {
      this.currentPage = val
      this.getList()
    },
    formatJson (filterVal, jsonData) {
      let that = this
      return jsonData.map(v => filterVal.map(j => that.handleColumn(v, j)))
    },
    getSizeToList (currentPage, limit = 2000) {
      return new Promise((resolve, reject) => {
        let requestParams = {}
        let url = this.fetchData.url
        if (!url) return
        let method = this.fetchData.method || 'get'
        method = method.toLowerCase()
        if (method === 'get') {
          url += `?size=${limit}&current=${currentPage}`
          Object.keys(this.params).forEach(key => {
            if (key.indexOf('_') === 0) return
            if (key && this.params[key]) url += `&${key}=${this.params[key]}`
          })
        } else if (method === 'post') {
          requestParams.data = this.fetchData.data
        }
        requestParams.url = url
        requestParams.method = this.fetchData.method
        this.$axios(requestParams)
          .then(res => {
            if (res.code === '1000') {
              resolve(res.data.content)
            } else {
              reject(new Error())
            }
          }).catch(err => {
            reject(err)
          })
      })
    },
    // 导出execl 没传prop值的剔除，如index,下载数据条数可通过downSize控制
    exportExcel () {
      const loading = this.$loading({
        lock: true,
        text: '下载中...'
      });
      let exportExcelSize = parseInt(this.$route.query.downSize) || 2000
      let page = Math.ceil(this.total / exportExcelSize)
      let promiseArr = []
      for (var i = 1; i <= page; i++) {
        promiseArr.push(this.getSizeToList(i, exportExcelSize))
      }
      Promise.all(promiseArr).then(arr => {
        let tableData = []
        arr.forEach(item => {
          tableData = tableData.concat(item)
        })
        // let excel = require('./vendor/Export2Excel')
        //   let columns = this.columns.filter(column => column.prop !== undefined)
        //   let tHeader = columns.map(column => {
        //     return column.label
        //   })
        //   let filterVal = columns.map(column => {
        //     return column.prop
        //   })
        //   const data = this.formatJson(filterVal, tableData);
        //   excel.export_json_to_excel({
        //     header: tHeader, // 表头 必填
        //     data, // 具体数据 必填
        //     filename: this.$route.meta.title || '列表数据' // 非必填
        //   })
        //   loading.close()
        import('./vendor/Export2Excel').then(excel => {
          let columns = this.columns.filter(column => column.prop !== undefined)
          let tHeader = columns.map(column => {
            return column.label
          })
          let filterVal = columns.map(column => {
            return column.prop
          })
          const data = this.formatJson(filterVal, tableData);
          excel.export_json_to_excel({
            header: tHeader, // 表头 必填
            data, // 具体数据 必填
            filename: this.$route.meta.title || '列表数据' // 非必填
          })
          loading.close()
        })
      }).catch(() => {
        loading.close()
        this.$message.error('下载表格失败')
      })
    },
    handleColumn (column, prop) {
      let props = prop.split('.')
      props.forEach(key => {
        column = column[key]
      })
      if (column === undefined || column === '') column = '-'
      return column
    },
    indexMethod (index) {
      return (this.currentPage - 1) * this.pageSize + index + 1
    }
  },

  filters: {
    handleColumn (column, prop) {
      let props = prop.split('.')
      props.forEach(key => {
        column = column[key]
      })
      if (column === undefined || column === '') column = '-'
      return column
    }
  }
}
</script>
<style scoped>
.header-form {
  margin-bottom: 10px;
  display: flex;
  align-content: center;
  flex-wrap: wrap;
}

.header-form-item {
  margin-right: 12px;
  margin-bottom: 10px;

}
  .header-form-label {
    font-size: 14px;
    color: #909399;
  }
.pagination-center {
  margin-top: 30px;
  text-align: center;
}
.header-title {
  display: flex;
  margin-bottom: 20px;
  font-size: 18px;
  color: #777;

}
  .header-title-item {
    margin-right: 15px;
    display: flex;
  }
</style>
