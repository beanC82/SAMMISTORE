import { API_ENDPOINT } from 'src/configs/api'
import instance from 'src/helpers/axios'
import { SaleRevenueFilterModel, ImportStatisticFilterModel, InventoryFilterModel } from '../types/report'

export const getCountUserType = async () => {
  try {
    const res = await instance.get(`${API_ENDPOINT.REPORT.INDEX}/user-type/count`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getCountProductStatus = async () => {
  try {
    const res = await instance.get(`${API_ENDPOINT.REPORT.INDEX}/product-status/count`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getCountAllRecords = async () => {
  try {
    const res = await instance.get(`${API_ENDPOINT.REPORT.INDEX}/all-records/count`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getCountProductTypes = async () => {
  try {
    const res = await instance.get(`${API_ENDPOINT.REPORT.INDEX}/product-type/count`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getCountRevenueYear = async () => {
  try {
    const res = await instance.get(`${API_ENDPOINT.REPORT.INDEX}/revenue-total`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getCountOrderStatus = async () => {
  try {
    const res = await instance.get(`${API_ENDPOINT.REPORT.INDEX}/order-status/count`)

    return res.data
  } catch (error) {
    return error
  }
}

export const getSalesRevenue = async (data: SaleRevenueFilterModel) => {
  try {
    const res = await instance.get(`${API_ENDPOINT.REPORT.INDEX}/sales-revenue`, {
      params: {
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        paymentMethodId: data.paymentMethodId,
        skip: data.skip,
        take: data.take,
        paging: data.paging,
        type: data.type,
        orderBy: data.orderBy,
        dir: data.dir,
        filters: data.filters,
        keywords: data.keywords,
        restrictOrderBy: data.restrictOrderBy
      }
    })
    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

export const getImportStatistics = async (data: ImportStatisticFilterModel) => {
  try {
    const res = await instance.get(`${API_ENDPOINT.REPORT.INDEX}/get-import-statistics`, {
      params: {
        dateFrom: data.dateFrom,
        dateTo: data.dateTo,
        employeeId: data.employeeId,
        supplierId: data.supplierId
      }
    })
    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}

export const getInventoryStatistics = async (data: InventoryFilterModel) => {
  try {
    const res = await instance.get(`${API_ENDPOINT.REPORT.INDEX}/inventory-statistics`, {
      params: {
        maximumStockQuantity: data.maximumStockQuantity,
        daysOfExistence: data.daysOfExistence,
        skip: data.skip,
        take: data.take,
        paging: data.paging,
        type: data.type,
        orderBy: data.orderBy,
        dir: data.dir,
        filters: data.filters,
        keywords: data.keywords,
        restrictOrderBy: data.restrictOrderBy
      }
    })
    return res.data
  } catch (error: any) {
    return error?.response?.data
  }
}
