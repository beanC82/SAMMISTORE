import { PERMISSIONS } from '@/configs/permission'
import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import AccountLayout from 'src/view/layout/AccountLayout'
import NoNavLayout from 'src/view/layout/NoNavLayout'

//views
const MyOrderPage = lazy(() => import('src/view/pages/account/my-order'))

type TProps = {}

const MyOrder: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <MyOrderPage />
        </Suspense>
    )
}

export default MyOrder

MyOrder.getLayout = (page: React.ReactNode) => (
    <NoNavLayout>
        <AccountLayout>{page}</AccountLayout>
    </NoNavLayout>
)

MyOrder.permission = [PERMISSIONS.ACCOUNT.MY_ORDER.VIEW]
