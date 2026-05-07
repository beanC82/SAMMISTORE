"use client";

// React & Next.js imports
import { NextPage } from "next";
import { memo, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";

// Material UI imports
import { GridColDef } from "@mui/x-data-grid";

// Components imports
const AdminPage = dynamic(() => import("src/components/admin-page"), {
  loading: () => <Spinner />,
  ssr: false
});

// Config imports
import { getCustomerFields } from "src/configs/gridConfig";
import { getCustomerColumns } from "src/configs/gridColumn";

// Redux imports
import { RootState } from "src/stores";
import { createSelector } from "@reduxjs/toolkit";
import {
  deleteMultipleCustomersAsync,
  deleteCustomerAsync,
  getAllCustomersAsync,
} from "src/stores/customer/action";
import { resetInitialState } from "src/stores/customer";
import Spinner from 'src/components/spinner';

// Component imports
const CreateUpdateCustomer = dynamic(() => import("./components/CreateUpdateCustomer"), {
  loading: () => <Spinner />,
  ssr: false
});



// Create a memoized selector for customer data
const createCustomerSelector = createSelector(
  (state: RootState) => state.customer.customers.data,
  (state: RootState) => state.customer.customers.total,
  (state: RootState) => state.customer,
  (data, total, customerState) => ({
    data,
    total,
    ...customerState,
  })
);

/**
 * Trang danh sách khách hàng
 * Sử dụng dynamic import để tối ưu performance
 * Sử dụng memo để tránh re-render không cần thiết
 */
const ListCustomerPage: NextPage = () => {
  // Sử dụng useMemo để cache columns, tránh tính toán lại mỗi lần render
  const columns: GridColDef[] = getCustomerColumns()
  
  // Use the memoized selector
  const customerSelector = useCallback((state: RootState) => createCustomerSelector(state), []);

  return (
    <Suspense fallback={<Spinner />}>
      <AdminPage
        entityName="customer"
        columns={columns}
        fields={getCustomerFields()}
        reduxSelector={customerSelector}
        fetchAction={getAllCustomersAsync}
        deleteAction={deleteCustomerAsync}
        deleteMultipleAction={deleteMultipleCustomersAsync as unknown as (ids: { [key: number]: number[] }) => any}
        resetAction={resetInitialState}
        CreateUpdateComponent={CreateUpdateCustomer as any}
        permissionKey="USER.CUSTOMER"
        fieldMapping={{
          "customer_name": "name",
          "customer_code": "code",
          "full_name": "fullName",
        }}
        noDataText="no_data_customer"
      />
    </Suspense>
  );
};

// Sử dụng memo để tránh re-render không cần thiết
export default memo(ListCustomerPage);