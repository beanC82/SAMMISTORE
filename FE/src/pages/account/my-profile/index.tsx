import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import AccountLayout from 'src/view/layout/AccountLayout'
import NoNavLayout from 'src/view/layout/NoNavLayout'

//views
const MyProfilePage = lazy(() => import('src/view/pages/account/my-profile'))

type TProps = {}

const MyProfile: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <MyProfilePage />
        </Suspense>
    )
}

export default MyProfile

MyProfile.getLayout = (page: React.ReactNode) => (
    <NoNavLayout>
        <AccountLayout>{page}</AccountLayout>
    </NoNavLayout>
)
