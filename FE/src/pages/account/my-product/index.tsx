import { PERMISSIONS } from '@/configs/permission'
import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import AccountLayout from 'src/view/layout/AccountLayout'
import NoNavLayout from 'src/view/layout/NoNavLayout'

//views
const MyProductPage = lazy(() => import('src/view/pages/account/my-product'))

type TProps = {}

const MyProduct: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <MyProductPage />
        </Suspense>
    )
}

export default MyProduct

MyProduct.getLayout = (page: React.ReactNode) => <NoNavLayout>
    <AccountLayout>
        {page}
    </AccountLayout>
</NoNavLayout>

MyProduct.permission = [PERMISSIONS.ACCOUNT.MY_PRODUCT.VIEW]
