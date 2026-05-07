import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
import InventoryStatisticsPage from '@/view/pages/manage-inventory-statistics'
//views
// Dynamically import the ListInventory component


type TProps = {}

const Inventory: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <InventoryStatisticsPage />
        </Suspense>
    )
}

Inventory.permission = [PERMISSIONS.MANAGE_ORDER.ORDER.VIEW]
export default Inventory

