import { RequestFilterModel } from 'src/types/common';

export interface SaleRevenueFilterModel extends RequestFilterModel {
  dateFrom?: string;
  dateTo?: string;
  paymentMethodId?: number;
  skip?: number;
  take?: number;
  paging?: boolean;
  type?: number;
  orderBy?: string;
  dir?: string;
  filters?: string;
  keywords?: string;
  restrictOrderBy?: boolean;
}

export interface ImportStatisticFilterModel {
  dateFrom?: string;
  dateTo?: string;
  employeeId?: number;
  supplierId?: number;
  skip?: number;
  take?: number;
  paging?: boolean;
  type?: number;
  orderBy?: string;
  dir?: string;
  filters?: string;
  keywords?: string;
  restrictOrderBy?: boolean;
}

export interface SaleRevenueData {
  date: string;
  totalOrders: number;
  totalRevenue: number;
}

export interface InventoryFilterModel extends RequestFilterModel {
  maximumStockQuantity?: number;
  daysOfExistence?: number;
  skip?: number;
  take?: number;
  paging?: boolean;
  type?: number;
  orderBy?: string;
  dir?: string;
  filters?: string;
  keywords?: string;
  restrictOrderBy?: boolean;
}

export interface InventoryStatisticDetail {
  id: number;
  code: string;
  name: string;
  stockQuantity: number;
  price: number;
  status: number;
  categoryId: number;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
  displayOrder: number;
  lastReceiptDate: string;
  daysSinceLastReceipt: number;
}

export interface InventoryStatistic {
  totalStockQuantity: number;
  totalAmount: number;
  inventoryDetails: InventoryStatisticDetail[];
}

export interface ImportStatisticDetail {
  id: number;
  code: string;
  employeeId: number;
  supplierId: number;
  status: string;
  note: string;
  createdDate: string;
  updatedDate: string;
  createdBy: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
  totalQuantity: number;
  totalPrice: number;
  employeeName: string;
  supplierName: string;
}

export interface ImportStatistic {
  imports: {
    subset: ImportStatisticDetail[];
    totalItemCount: number;
  };
  totalQuantity: number;
  totalAmount: number;
} 