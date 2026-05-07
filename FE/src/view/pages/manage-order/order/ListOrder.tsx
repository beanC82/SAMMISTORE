"use client"

//React
import React, { useCallback, useEffect, useMemo, useState } from 'react'

//Next
import { NextPage } from 'next'

//MUI
import { Chip, ChipProps, Typography, useTheme, Box } from '@mui/material'
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'

//redux
import { RootState } from 'src/stores'
import { createSelector } from '@reduxjs/toolkit'

//translation
import { useTranslation } from 'react-i18next'

import { resetInitialState } from 'src/stores/user'
import { styled } from '@mui/material'
import { deleteOrderAsync, getAllManageOrderAsync } from 'src/stores/order/action'
import OrderDetail from './components/OrderDetail'
import dynamic from 'next/dynamic'
import { getOrderFields } from 'src/configs/gridConfig'
import { formatDate } from 'src/utils'
import { getOrderColumns } from 'src/configs/gridColumn'
import Spinner from 'src/components/spinner'
import AdminPage from '@/components/admin-page'
import CreateOrder from './components/CreateOrder'
import CreateNewCustomer from './components/CreateNewCustomer'
type TProps = {}

interface TStatusChip extends ChipProps {
    background: string
}


// Create a memoized selector for order data
const createOrderSelector = createSelector(
    (state: RootState) => state.order.orderProducts.data,
    (state: RootState) => state.order.orderProducts.total,
    (state: RootState) => state.order,
    (data, total, orderState) => ({
        data,
        total,
        ...orderState,
    })
);


const ListOrderPage: NextPage<TProps> = () => {
    const { t } = useTranslation()
    const theme = useTheme()
    const [currentTab, setCurrentTab] = useState(0)
    const [selectedOrderId, setSelectedOrderId] = useState<number>(0)
    const [showCreateTab, setShowCreateTab] = React.useState(false);
    const [showCreateNewTab, setShowCreateNewTab] = React.useState(false);
    
    const [showUpdateTab, setShowUpdateTab] = React.useState(false);
    const [showDetailTab, setShowDetailTab] = React.useState(false);

    const columns = getOrderColumns()

    // Use the memoized selector
    const orderSelector = useCallback((state: RootState) => createOrderSelector(state), []);

    const handleTabChange = (newTab: number) => {
        setCurrentTab(newTab);
        if (newTab === 0) {
            setSelectedOrderId(0)
        }
    };

    
    const handleAddClick = () => {
        setCurrentTab(1);
        setShowCreateTab(true);
    };

    
  const handleCreateNewClick = () => {
    setCurrentTab(4);
    setShowCreateNewTab(true);
  };

    const handleDetailClick = (id: number) => {
        setSelectedOrderId(id);
        setShowDetailTab(true);
        setCurrentTab(3);
    };

    const handleCloseCreateTab = () => {
        setCurrentTab(0);
        setShowCreateTab(false);
    };

    const handleCloseCreateNewTab = () => {
        setCurrentTab(1);
        setShowCreateNewTab(false);
    };

    return (
        <Box sx={{ backgroundColor: 'background.paper', p: 3 }}>
            <AdminPage
                entityName="order"
                columns={columns}
                reduxSelector={createOrderSelector}
                fields={getOrderFields()}
                fetchAction={getAllManageOrderAsync}
                deleteAction={deleteOrderAsync}
                deleteMultipleAction={() => { }}
                resetAction={resetInitialState}
                permissionKey="SYSTEM.MANAGE_ORDER.ORDER"
                noDataText="no_data_order"
                fieldMapping={{
                    "fullname": "customerName",
                }}
                CreateUpdateTabComponent = {CreateOrder}
                CreateNewTabComponent={CreateNewCustomer}
                DetailComponent={OrderDetail}
                showTab={true}
                showCreateTab={showCreateTab}
                showDetailTab={showDetailTab}
                showCreateNewTab={showCreateNewTab}
                currentTab={currentTab}
                onTabChange={handleTabChange}
                onDetailClick={handleDetailClick}
                onAddClick={handleAddClick}
                onCreateNewClick={handleCreateNewClick}

                onCloseDetailTab={() => {
                    setShowDetailTab(false)
                    setCurrentTab(0)
                }}
                onCloseCreateTab={handleCloseCreateTab}
                onCloseCreateNewTab={handleCloseCreateNewTab}

                hideUpdateButton={true}
                hideDeleteButton={true}

                showDetailButton={true}
                showOrderFilter={true}
                hideTableHeader={true}
                showUpdateOrderStatusHeader={true}
            />
        </Box>
    )
}

export default ListOrderPage