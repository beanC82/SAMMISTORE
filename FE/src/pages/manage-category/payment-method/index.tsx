import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
//views
const ListPaymentMethod = lazy(() => import('src/view/pages/manage-category/payment-method/ListPaymentMethod'))

type TProps = {}

const PaymentMethod: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<></>}>
            <ListPaymentMethod />
        </Suspense>
    )
}

export default PaymentMethod

PaymentMethod.permission = [PERMISSIONS.SETTING.PAYMENT_METHOD.VIEW]