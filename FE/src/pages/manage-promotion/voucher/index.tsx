import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
//views
// Dynamically import the ListVoucher component
const ListVoucherPage = lazy(() => import('src/view/pages/manage-promotion/voucher/ListVoucher'))

type TProps = {}

const Voucher: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ListVoucherPage />
        </Suspense>
    )
}

export default Voucher

Voucher.permission = [PERMISSIONS.MANAGE_PROMOTION.VOUCHER.VIEW]
