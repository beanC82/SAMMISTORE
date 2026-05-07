import { PERMISSIONS } from '@/configs/permission'
import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import NoNavLayout from 'src/view/layout/NoNavLayout'

//views
const CheckoutPage = lazy(() => import('src/view/pages/checkout'))

type TProps = {}

const Checkout: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <CheckoutPage />
        </Suspense>
    )
}

export default Checkout

Checkout.getLayout = (page: React.ReactNode) => <NoNavLayout>{page}</NoNavLayout>

Checkout.permission = [PERMISSIONS.CHECKOUT]
