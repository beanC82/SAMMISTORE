"use client"

//React
import React, { useCallback, useEffect, useState } from 'react'

//Next
import { NextPage } from 'next'
import dynamic from 'next/dynamic'

//redux
import { RootState } from 'src/stores'
import { createSelector } from '@reduxjs/toolkit'

//components
const CreateUpdatePaymentMethod = dynamic(() => import('./components/CreateUpdatePaymentMethod'), {
    ssr: false
}) as React.FC<any>

import { deleteMultiplePaymentMethodsAsync, deletePaymentMethodAsync, getAllPaymentMethodsAsync } from 'src/stores/payment-method/action'
import { resetInitialState } from 'src/stores/payment-method'
import Spinner from 'src/components/spinner'
// Dynamic import for AdminPage
const AdminPage = dynamic(() => import("src/components/admin-page"), {
    loading: () => <Spinner />,
    ssr: false
});

import { getPaymentMethodFields } from 'src/configs/gridConfig'
import { getPaymentMethodColumns } from 'src/configs/gridColumn'
type TProps = {}

// Create a memoized selector for payment method data
const createPaymentMethodSelector = createSelector(
    (state: RootState) => state.paymentMethod.paymentMethods.data,
    (state: RootState) => state.paymentMethod.paymentMethods.total,
    (state: RootState) => state.paymentMethod,
    (data, total, paymentMethodState) => ({
        data,
        total,
        ...paymentMethodState
    })
);

const ListPaymentMethod: NextPage<TProps> = () => {
    // Use the memoized selector
    const paymentMethodSelector = useCallback((state: RootState) => createPaymentMethodSelector(state), []);
    
    const columns = getPaymentMethodColumns()

    return (
        <AdminPage
            entityName="payment_method"
            columns={columns}
            fields={getPaymentMethodFields()}
            reduxSelector={paymentMethodSelector}
            fetchAction={getAllPaymentMethodsAsync}
            deleteAction={deletePaymentMethodAsync}
            hideUpdateButton={true}
            hideDeleteButton={true}
            deleteMultipleAction={deleteMultiplePaymentMethodsAsync as unknown as (ids: { [key: number]: number[] }) => any}
            resetAction={resetInitialState}
            CreateUpdateComponent={CreateUpdatePaymentMethod}
            permissionKey="SETTING.PAYMENT_METHOD"
            fieldMapping={{
                "payment_method_name": "name",
                "created_at": "createdAt"
            }}
            noDataText="no_data_payment_method"
        />
    )
}

export default ListPaymentMethod
