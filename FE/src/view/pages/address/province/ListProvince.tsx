"use client";

import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { getProvinceFields } from "src/configs/gridConfig";
const CreateUpdateProvince = dynamic(() => import("./components/CreateUpdateProvince").then(mod => mod.default), {
  ssr: false
}) as React.FC<any>;
import {
  deleteMultipleProvincesAsync,
  deleteProvinceAsync,
  getAllProvincesAsync,
} from "src/stores/province/action";
import { resetInitialState } from "src/stores/province";
import { RootState } from "src/stores";
import { createSelector } from "@reduxjs/toolkit";
import { getProvinceColumns } from "src/configs/gridColumn";
import Spinner from "src/components/spinner";
// Dynamic import for AdminPage
const AdminPage = dynamic(() => import("src/components/admin-page"), {
    loading: () => <Spinner />,
    ssr: false
});

// Create a memoized selector for province data
const createProvinceSelector = createSelector(
  (state: RootState) => state.province.provinces.data,
  (state: RootState) => state.province.provinces.total,
  (state: RootState) => state.province,
  (data, total, provinceState) => ({
    data,
    total,
    ...provinceState,
  })
);

const ListProvincePage: NextPage = () => {
  const columns = getProvinceColumns();
  
  // Use the memoized selector
  const provinceSelector = useCallback((state: RootState) => createProvinceSelector(state), []);
  
  return (
    <AdminPage
      entityName="province"
      columns={columns}
      fields={getProvinceFields()}
      reduxSelector={provinceSelector}
      fetchAction={getAllProvincesAsync}
      deleteAction={deleteProvinceAsync}
      deleteMultipleAction={deleteMultipleProvincesAsync as unknown as (ids: { [key: number]: number[] }) => any}
      resetAction={resetInitialState}
      CreateUpdateComponent={CreateUpdateProvince}
      hideDeleteButton={true}
      permissionKey="ADDRESS.PROVINCE"
      fieldMapping={{
        "province_name": "name",
        "province_code": "code",
        "postal_code": "postalCode",
      }}
      noDataText="no_data_province"
    />
  );
};

export default ListProvincePage;