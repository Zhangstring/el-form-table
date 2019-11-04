import FormTable from './el-form-table/index.vue'
var formTable = {}
formTable.install = function (Vue, options) {
  Vue.component('form-table', FormTable)
  if (options.axios) {
    Vue.prototype.$axios = options.axios
  }
}
export default formTable
