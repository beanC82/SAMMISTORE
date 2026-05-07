import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
//views
const ListReceiptPage = lazy(() => import('src/view/pages/goods-receipt/receipt/ListReceipt'))

type TProps = {}

const Receipt: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ListReceiptPage />
        </Suspense>
    )
}

export default Receipt

Receipt.permission = [PERMISSIONS.GOODS_RECEIPT.RECEIPT_LIST.VIEW]
