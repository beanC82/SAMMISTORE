import { PERMISSIONS } from '@/configs/permission'
import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import AccountLayout from 'src/view/layout/AccountLayout'
import NoNavLayout from 'src/view/layout/NoNavLayout'

//views
const MyVouchersPage = lazy(() => import('src/view/pages/account/my-vouchers'))

type TProps = {}

const MyVouchers: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <MyVouchersPage />
        </Suspense>
    )
}

export default MyVouchers

MyVouchers.getLayout = (page: React.ReactNode) => <NoNavLayout>
    <AccountLayout>
        {page}
    </AccountLayout>
</NoNavLayout>

MyVouchers.permission = [PERMISSIONS.ACCOUNT.MY_VOUCHER.VIEW]
