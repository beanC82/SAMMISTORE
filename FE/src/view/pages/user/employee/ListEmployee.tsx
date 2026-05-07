"use client";

// React & Next.js imports
import { NextPage } from "next";
import { memo, Suspense, useCallback } from "react";
import dynamic from "next/dynamic";

// Components imports
const AdminPage = dynamic(() => import("src/components/admin-page"), {
  loading: () => <Spinner />,
  ssr: false
});

// Config imports
import { getEmployeeFields } from "src/configs/gridConfig";
import { getEmployeeColumns } from "src/configs/gridColumn";
import Spinner from 'src/components/spinner';

// Redux imports
import { RootState } from "src/stores";
import { createSelector } from "@reduxjs/toolkit";
import {
  deleteMultipleEmployeesAsync,
  deleteEmployeeAsync,
  getAllEmployeesAsync,
} from "src/stores/employee/action";
import { resetInitialState } from "src/stores/employee";


const CreateUpdateEmployee = dynamic(() => import("./components/CreateUpdateEmployee"), {
  loading: () => <></>,
  ssr: false
});


const createEmployeeSelector = createSelector(
  (state: RootState) => state.employee.employees.data,
  (state: RootState) => state.employee.employees.total,
  (state: RootState) => state.employee,
  (data, total, employeeState) => ({
    data,
    total,
    ...employeeState,
  })
);


const ListEmployeePage: NextPage = () => {

  const columns = getEmployeeColumns();
  

  const employeeSelector = useCallback((state: RootState) => createEmployeeSelector(state), []);

  return (
    <Suspense fallback={<Spinner />}>
      <AdminPage
        entityName="employee"
        columns={columns}
        fields={getEmployeeFields()}
        reduxSelector={employeeSelector}
        fetchAction={getAllEmployeesAsync}
        deleteAction={deleteEmployeeAsync}
        deleteMultipleAction={deleteMultipleEmployeesAsync as unknown as (ids: { [key: number]: number[] }) => any}
        resetAction={resetInitialState}
        CreateUpdateComponent={CreateUpdateEmployee as any}
        permissionKey="USER.EMPLOYEE"
        fieldMapping={{
          "employee_name": "name",
          "employee_code": "code",
          "full_name": "fullName",
        }}
        noDataText="no_data_employee"
      />
    </Suspense>
  );
};


export default memo(ListEmployeePage);