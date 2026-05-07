"use client";

import { NextPage } from "next";
import { useCallback } from "react";
import { getWardFields } from "src/configs/gridConfig";
import CreateUpdateWard from "./components/CreateUpdateWard";
import {
    deleteMultipleWardsAsync,
    deleteWardAsync,
    getAllWardsAsync,
} from "src/stores/ward/action";
import { resetInitialState } from "src/stores/ward";
import { RootState } from "src/stores";
import { createSelector } from "@reduxjs/toolkit";
import dynamic from "next/dynamic";
import { getWardColumns } from "src/configs/gridColumn";
import Spinner from "src/components/spinner";

// Dynamic import for AdminPage
const AdminPage = dynamic(() => import("src/components/admin-page"), {
    loading: () => <Spinner />,
    ssr: false
});

// Create a memoized selector for ward data
const createWardSelector = createSelector(
    (state: RootState) => state.ward.wards.data,
    (state: RootState) => state.ward.wards.total,
    (state: RootState) => state.ward,
    (data, total, wardState) => ({
        data,
        total,
        ...wardState,
    })
);

const ListWardPage: NextPage = () => {
    const columns = getWardColumns();
    
    // Use the memoized selector
    const wardSelector = useCallback((state: RootState) => createWardSelector(state), []);
    
    return (
        <AdminPage
            entityName="ward"
            columns={columns}
            fields={getWardFields()}
            reduxSelector={wardSelector}
            fetchAction={getAllWardsAsync}
            deleteAction={deleteWardAsync}
            deleteMultipleAction={deleteMultipleWardsAsync as unknown as (ids: { [key: number]: number[] }) => any}
            resetAction={resetInitialState}
            CreateUpdateComponent={CreateUpdateWard}
            permissionKey="ADDRESS.WARD"
            hideUpdateButton={true}
            fieldMapping={{
                "ward_name": "name",
                "ward_code": "code",
                "district_name": "districtName",
                "district_code": "districtCode",
            }}
            noDataText="no_data_ward"
        />
    );
};

export default ListWardPage;