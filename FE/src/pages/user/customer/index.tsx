import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
//configs
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
//Pages
// Dynamically import the ListCustomer component
const ListCustomerPage = lazy(() => import('src/view/pages/user/customer/ListCustomer'))

type TProps = {}

const Customer: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ListCustomerPage />
        </Suspense>
    )
}

Customer.permission = [PERMISSIONS.USER.CUSTOMER.VIEW]
export default Customer

