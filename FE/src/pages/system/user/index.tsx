import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
//configs
import { PERMISSIONS } from 'src/configs/permission'

//Pages
// Dynamically import the ListUser component
const ListUserPage = lazy(() => import('src/view/pages/system/user/ListUser'))

type TProps = {}

const User: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ListUserPage />
        </Suspense>
    )
}

User.permission = [PERMISSIONS.SYSTEM.USER.VIEW]
export default User

