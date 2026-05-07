import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
import RevenueStatisticsPage from '@/view/pages/manage-revenue'
//views

type TProps = {}

const Revenue: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
          <RevenueStatisticsPage />
        </Suspense>
    )
}

export default Revenue

