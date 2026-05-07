import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import NoNavLayout from 'src/view/layout/NoNavLayout'
import Spinner from 'src/components/spinner'
import { PERMISSIONS } from '@/configs/permission'
//views
// Dynamically import the MyCart component
const MyCartPage = lazy(() => import('src/view/pages/my-cart'))

type TProps = {}

const MyCart: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <MyCartPage />
        </Suspense>
    )
}

export default MyCart

MyCart.getLayout = (page: React.ReactNode) => <NoNavLayout>{page}</NoNavLayout>

MyCart.permission = [PERMISSIONS.MY_CART]

