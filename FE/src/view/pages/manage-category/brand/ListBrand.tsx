"use client";

// React & Next.js imports
import { NextPage } from "next";
import dynamic from "next/dynamic";

// Material UI imports
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Typography } from "@mui/material";

// i18n imports
import { useTranslation } from "react-i18next";

// Redux imports
import { RootState } from "src/stores";
import { createSelector } from "@reduxjs/toolkit";
import {
  deleteMultipleBrandsAsync,
  deleteBrandAsync,
  getAllBrandsAsync,
} from "src/stores/brand/action";
import { resetInitialState } from "src/stores/brand";

// Component imports
import { FC, useCallback } from "react";

// Config imports
import { getBrandFields } from "src/configs/gridConfig";
import { getBrandColumns } from "src/configs/gridColumn";
import Spinner from "src/components/spinner";
// Dynamic import for CreateUpdateBrand component to reduce initial bundle size
const CreateUpdateBrand = dynamic(
  () => import("./components/CreateUpdateBrand"),
  {
    loading: () => <Spinner />,
    ssr: false // Disable SSR for this component since it's not needed on initial load
  }
);

// Dynamic import for AdminPage
const AdminPage = dynamic(() => import("src/components/admin-page"), {
    loading: () => <Spinner />,
    ssr: false
});

// Create a memoized selector for brand data
const createBrandSelector = createSelector(
  (state: RootState) => state.brand.brands.data,
  (state: RootState) => state.brand.brands.total,
  (state: RootState) => state.brand,
  (data, total, brandState) => ({
    data,
    total,
    ...brandState,
  })
);


const ListBrandPage: NextPage = () => {
  const columns = getBrandColumns();
  
  const brandSelector = useCallback((state: RootState) => createBrandSelector(state), []);

  return (
    <AdminPage
      entityName="brand"
      columns={columns}
      fields={getBrandFields()}
      reduxSelector={brandSelector}
      fetchAction={getAllBrandsAsync}
      deleteAction={deleteBrandAsync}
      deleteMultipleAction={deleteMultipleBrandsAsync as unknown as (ids: { [key: number]: number[] }) => any}
      resetAction={resetInitialState}
      CreateUpdateComponent={CreateUpdateBrand as FC<any>}
      permissionKey="MANAGE_PRODUCT.BRAND"
      fieldMapping={{
        "brand_name": "name",
        "brand_code": "code",
      }}
      noDataText="no_data_brand"
    />
  );
};

export default ListBrandPage;