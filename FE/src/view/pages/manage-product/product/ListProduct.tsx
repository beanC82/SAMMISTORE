"use client";

import { NextPage } from "next";
import dynamic from "next/dynamic";
import { useState, useMemo, useCallback, Suspense } from "react";
import { RootState } from "src/stores";
import { createSelector } from "@reduxjs/toolkit";
import { resetInitialState } from "src/stores/product";
import {
    deleteMultipleProductsAsync,
    deleteProductAsync,
    getAllProductsAsync,
} from "src/stores/product/action";
import { getProductColumns } from "src/configs/gridColumn";
import { getProductFields } from "src/configs/gridConfig";
import Spinner from "src/components/spinner";

// Constants for field mapping
const FIELD_MAPPING = {
    "product_name": "name",
    "province_name": "provinceName",
    "province_code": "provinceCode",
} as const;

// Dynamically import AdminPage and CreateUpdateProduct with proper typing
const AdminPage = dynamic(() => import("src/components/admin-page"), {
    loading: () => <Spinner />,
    ssr: false
});

const CreateUpdateProduct = dynamic(() => import("./components/CreateUpdateProduct"), {
    loading: () => <Spinner />,
    ssr: false
}) as any;

// Create a memoized selector for product data
const createProductSelector = createSelector(
    (state: RootState) => state.product.products.data || [],
    (state: RootState) => state.product.products.total || 0,
    (state: RootState) => state.product,
    (data, total, productState) => ({
        data,
        total,
        ...productState,
    })
);

// Separate state management into a custom hook
const useProductState = () => {
    const [currentTab, setCurrentTab] = useState(0);
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [showCreateTab, setShowCreateTab] = useState(false);
    const [showUpdateTab, setShowUpdateTab] = useState(false);
    const [showDetailTab, setShowDetailTab] = useState(false);

    const handleTabChange = useCallback((newTab: number) => {
        setCurrentTab(newTab);
        if (newTab === 0) {
            setSelectedProductId(0);
        }
    }, []);

    const handleDetailClick = useCallback((id: number) => {
        setSelectedProductId(id);
        setShowDetailTab(true);
        setCurrentTab(3);
    }, []);

    const handleAddClick = useCallback(() => {
        setCurrentTab(1);
        setShowCreateTab(true);
    }, []);

    const handleUpdateClick = useCallback(() => {
        setCurrentTab(2);
        setShowUpdateTab(true);
    }, []);

    const handleCloseCreateTab = useCallback(() => setShowCreateTab(false), []);
    const handleCloseUpdateTab = useCallback(() => setShowUpdateTab(false), []);
    const handleCloseDetailTab = useCallback(() => setShowDetailTab(false), []);

    return {
        currentTab,
        selectedProductId,
        showCreateTab,
        showUpdateTab,
        showDetailTab,
        handleTabChange,
        handleDetailClick,
        handleAddClick,
        handleUpdateClick,
        handleCloseCreateTab,
        handleCloseUpdateTab,
        handleCloseDetailTab
    };
};

const ListProductPage: NextPage = () => {
    const {
        currentTab,
        selectedProductId,
        showCreateTab,
        showUpdateTab,
        showDetailTab,
        handleTabChange,
        handleDetailClick,
        handleAddClick,
        handleUpdateClick,
        handleCloseCreateTab,
        handleCloseUpdateTab,
        handleCloseDetailTab
    } = useProductState();

    const columns = getProductColumns();

    // Use the memoized selector
    const productSelector = useCallback((state: RootState) => createProductSelector(state), []);

    // Memoize fields to prevent unnecessary re-renders
    const fields = useMemo(() => {
        try {
            return getProductFields();
        } catch (error) {
            console.error('Error getting product fields:', error);
            return [];
        }
    }, []);

    return (
        <Suspense fallback={<Spinner />}>
            <div className="w-full h-full">
                <AdminPage
                    entityName="product"
                    columns={columns}
                    fields={fields}
                    reduxSelector={productSelector}
                    fetchAction={getAllProductsAsync}
                    deleteAction={deleteProductAsync as unknown as (id: number) => any}
                    deleteMultipleAction={deleteMultipleProductsAsync as unknown as (ids: { [key: number]: number[] }) => any}
                    resetAction={resetInitialState}
                    CreateUpdateTabComponent={CreateUpdateProduct}
                    permissionKey="MANAGE_PRODUCT.PRODUCT"
                    fieldMapping={FIELD_MAPPING}
                    noDataText="no_data_product"
                    showTab={true}
                    showCreateTab={showCreateTab}
                    showDetailTab={showDetailTab}
                    showUpdateTab={showUpdateTab}
                    currentTab={currentTab}
                    onTabChange={handleTabChange}
                    onAddClick={handleAddClick}
                    onUpdateClick={handleUpdateClick}

                    onDetailClick={handleDetailClick}
                    onCloseCreateTab={handleCloseCreateTab}
                    onCloseUpdateTab={handleCloseUpdateTab}
                    onCloseDetailTab={handleCloseDetailTab}
                />
            </div>
        </Suspense>
    );
};

// Add display name for better debugging
ListProductPage.displayName = "ListProductPage";

export default ListProductPage;