import { NextPage } from 'next'
import { lazy, Suspense } from 'react'

//configs
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
//Pages
const ListSupplierPage = lazy(() => import('src/view/pages/user/supplier/ListSupplier'))

type TProps = {}

const Supplier: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ListSupplierPage />
        </Suspense>
    )
}

Supplier.permission = [PERMISSIONS.USER.SUPPLIER.VIEW]
export default Supplier

