"use client";

import { NextPage } from "next";
import dynamic from "next/dynamic";
import { FC, useCallback } from "react";
import { createSelector } from "@reduxjs/toolkit";

import {
    deleteMultipleVouchersAsync,
    deleteVoucherAsync,
    getAllVouchersAsync,
} from "src/stores/voucher/action";
import { resetInitialState } from "src/stores/voucher";
import { RootState } from "src/stores";
import { getVoucherColumns } from "src/configs/gridColumn";
import { getVoucherFields } from "src/configs/gridConfig";
import { useState } from "react";
import Spinner from "src/components/spinner";
const CreateUpdateVoucher = dynamic(() => import("./components/CreateUpdateVoucher"), {
    ssr: false
}) as FC<any>;

// Dynamic import for AdminPage
const AdminPage = dynamic(() => import("src/components/admin-page"), {
    loading: () => <Spinner />,
    ssr: false
});

// Create a memoized selector for voucher data
const createVoucherSelector = createSelector(
    (state: RootState) => state.voucher.vouchers.data,
    (state: RootState) => state.voucher.vouchers.total,
    (state: RootState) => state.voucher,
    (data, total, voucherState) => ({
        data,
        total,
        ...voucherState,
    })
);

const ListVoucherPage: NextPage = () => {
    const columns = getVoucherColumns();

    // Use the memoized selector
    const voucherSelector = useCallback((state: RootState) => createVoucherSelector(state), []);

    const [currentTab, setCurrentTab] = useState(0);
    const [selectedVoucherId, setSelectedVoucherId] = useState<number>(0);
    const [showCreateTab, setShowCreateTab] = useState(false);
    const [showUpdateTab, setShowUpdateTab] = useState(false);
    const [showDetailTab, setShowDetailTab] = useState(false);

    const handleTabChange = (newTab: number) => {
        setCurrentTab(newTab);
        if (newTab === 0) {
            setSelectedVoucherId(0);
        }
    };

    const handleDetailClick = (id: number) => {
        setSelectedVoucherId(id);
        setShowDetailTab(true);
        setCurrentTab(3);
    };

    const handleAddClick = () => {
        setCurrentTab(1);
        setShowCreateTab(true);
    };

    const handleUpdateClick = () => {
        setCurrentTab(2);
        setShowUpdateTab(true);
    };

    const handleCloseCreateTab = () => {
        setCurrentTab(0);
        setShowCreateTab(false);
    };

    const handleCloseUpdateTab = () => {
        setCurrentTab(0);
        setShowUpdateTab(false);
    };

    return (
        <AdminPage
            entityName="voucher"
            columns={columns}
            fields={getVoucherFields()}
            reduxSelector={voucherSelector}
            fetchAction={getAllVouchersAsync}
            deleteAction={deleteVoucherAsync}
            deleteMultipleAction={deleteMultipleVouchersAsync as unknown as (ids: { [key: number]: number[] }) => any}
            resetAction={resetInitialState}
            showTab={true}
            showCreateTab={showCreateTab}
            showUpdateTab={showUpdateTab}
            showDetailTab={showDetailTab}
            currentTab={currentTab}
            onTabChange={handleTabChange}
            onAddClick={handleAddClick}
            onUpdateClick={handleUpdateClick}
            onDetailClick={handleDetailClick}
            onCloseCreateTab={handleCloseCreateTab}
            onCloseUpdateTab={handleCloseUpdateTab}
            CreateUpdateTabComponent={CreateUpdateVoucher}
            permissionKey="MANAGE_PROMOTION.VOUCHER"
            fieldMapping={{
                "voucher_name": "name",
                "voucher_code": "code",
                "event_name": "eventName",
                "start_date": "startDate",
                "end_date": "endDate",
                "discount_name": "discountName",
                "discount_value": "discountValue",
                "usage_limit": "usageLimit",
                "used_count": "usedCount",
            }}
            noDataText="no_data_voucher"
        />
    );
};

export default ListVoucherPage;