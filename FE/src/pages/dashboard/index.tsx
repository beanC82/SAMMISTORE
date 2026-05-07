import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
//views
// Dynamically import the Dashboard component
const DashboardPage = lazy(() => import('src/view/pages/dashboard'))

type TProps = {}

const Dashboard: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <DashboardPage />
        </Suspense>
    )
}

Dashboard.permission = [PERMISSIONS.DASHBOARD]
export default Dashboard

