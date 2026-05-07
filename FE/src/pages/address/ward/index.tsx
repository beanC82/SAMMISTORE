import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
//views
// Dynamically import the ListWard component
const ListWardPage = lazy(() => import('src/view/pages/address/ward/ListWard'))

type TProps = {}

const Ward: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<></>}>
            <ListWardPage />
        </Suspense>
    )
}

export default Ward

Ward.permission = [PERMISSIONS.ADDRESS.WARD.VIEW]
