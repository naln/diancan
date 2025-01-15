import * as XLSX from 'xlsx'
import { ElMessage } from 'element-plus'

export const exportToExcel = (data, filename = 'export') => {
  try {
    // 如果是多个工作表的数据
    if (typeof data === 'object' && !Array.isArray(data)) {
      const wb = XLSX.utils.book_new()
      
      // 遍历每个工作表的数据
      Object.entries(data).forEach(([sheetName, sheetData]) => {
        const ws = XLSX.utils.aoa_to_sheet(sheetData)
        XLSX.utils.book_append_sheet(wb, ws, sheetName)
      })
      
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } 
    // 如果是单个工作表的数据
    else if (Array.isArray(data)) {
      const ws = XLSX.utils.aoa_to_sheet(data)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
      XLSX.writeFile(wb, `${filename}.xlsx`)
    } else {
      throw new Error('Invalid data format')
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error('导出失败，请重试')
  }
} 