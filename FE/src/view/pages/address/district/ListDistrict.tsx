"use client";

import { NextPage } from "next";
import { useCallback } from "react";
import { getDistrictFields } from "src/configs/gridConfig";
import CreateUpdateDistrict from "./components/CreateUpdateDistrict";
import {
    deleteMultipleDistrictsAsync,
    deleteDistrictAsync,
    getAllDistrictsAsync,
} from "src/stores/district/action";
import { resetInitialState } from "src/stores/district";
import { RootState } from "src/stores";
import { createSelector } from "@reduxjs/toolkit";
import dynamic from "next/dynamic";
import { getDistrictColumns } from "src/configs/gridColumn";
import Spinner from "src/components/spinner";
// Dynamic import for AdminPage
const AdminPage = dynamic(() => import("src/components/admin-page"), {
    loading: () => <Spinner />,
    ssr: false
});

// Create a memoized selector for district data
const createDistrictSelector = createSelector(
    (state: RootState) => state.district.districts.data,
    (state: RootState) => state.district.districts.total,
    (state: RootState) => state.district,
    (data, total, districtState) => ({
        data,
        total,
        ...districtState,
    })
);

const ListDistrictPage: NextPage = () => {
    const columns = getDistrictColumns();
    
    // Use the memoized selector
    const districtSelector = useCallback((state: RootState) => createDistrictSelector(state), []);

    return (
        <AdminPage
            entityName="district"
            columns={columns}
            fields={getDistrictFields()}
            reduxSelector={districtSelector}
            fetchAction={getAllDistrictsAsync}
            deleteAction={deleteDistrictAsync}
            deleteMultipleAction={deleteMultipleDistrictsAsync as unknown as (ids: { [key: number]: number[] }) => any}
            resetAction={resetInitialState}
            CreateUpdateComponent={CreateUpdateDistrict}
            hideUpdateButton={true}
            permissionKey="ADDRESS.DISTRICT"
            fieldMapping={{
                "district_name": "name",
                "district_code": "code",
                "province_name": "provinceName",
                "province_code": "provinceCode",
            }}
            noDataText="no_data_district"
        />
    );
};

export default ListDistrictPage;