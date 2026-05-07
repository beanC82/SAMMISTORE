import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'

//views
const ListProvincePage = lazy(() => import('src/view/pages/address/province/ListProvince'))

type TProps = {}

const Province: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<></>}>
            <ListProvincePage />
        </Suspense>
    )
}

export default Province

Province.permission = [PERMISSIONS.ADDRESS.PROVINCE.VIEW]
