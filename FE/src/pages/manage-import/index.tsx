import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
import ImportStatisticsPage from '@/view/pages/manage-import'
//views
// Dynamically import the ListImport component


type TProps = {}

const Import: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
          <ImportStatisticsPage />
        </Suspense>
    )
}

Import.permission = [PERMISSIONS.MANAGE_ORDER.ORDER.VIEW]
export default Import

