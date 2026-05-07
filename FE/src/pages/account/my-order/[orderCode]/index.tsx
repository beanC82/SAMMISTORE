import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import AccountLayout from 'src/view/layout/AccountLayout'
import NoNavLayout from 'src/view/layout/NoNavLayout'
import { PERMISSIONS } from '@/configs/permission'
//views
const MyOrderDetailPage = lazy(() => import('src/view/pages/account/my-order/OrderDetail'))

type TProps = {}

const MyOrderDetail: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <MyOrderDetailPage />
        </Suspense>
    )
}

MyOrderDetail.permission = [PERMISSIONS.ACCOUNT.MY_ORDER.VIEW]

export default MyOrderDetail

MyOrderDetail.getLayout = (page: React.ReactNode) => <NoNavLayout>
    <AccountLayout>
        {page}
    </AccountLayout>
</NoNavLayout>

