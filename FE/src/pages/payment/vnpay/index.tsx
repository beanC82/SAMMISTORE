import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import NoNavLayout from 'src/view/layout/NoNavLayout'

//views
const PaymentPage = lazy(() => import('src/view/pages/payment/vnpay'))


type TProps = {}

const Payment: NextPage<TProps> = () => {
        return (
        <Suspense fallback={<Spinner />}>
            <PaymentPage />
        </Suspense>
    )
}

export default Payment

Payment.getLayout = (page: React.ReactNode) => <NoNavLayout>{page}</NoNavLayout>

