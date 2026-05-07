import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
//Pages
// Dynamically import the ListRole component
const ListRolePage = lazy(() => import('src/view/pages/system/role/ListRole'))

//views

type TProps = {}

const Role: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ListRolePage />
        </Suspense>
    )
}

Role.permission = [PERMISSIONS.SYSTEM.ROLE.VIEW]
export default Role

