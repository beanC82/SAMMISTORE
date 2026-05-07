import { PERMISSIONS } from '@/configs/permission'
import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import AccountLayout from 'src/view/layout/AccountLayout'
//views
import NoNavLayout from 'src/view/layout/NoNavLayout'
// Dynamically import the ChangePassword component
const ChangePasswordPage = lazy(() => import('src/view/pages/account/change-password'))

type TProps = {}

const ChangePassword: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ChangePasswordPage />
        </Suspense>
    )
}

export default ChangePassword

ChangePassword.getLayout = (page: React.ReactNode) => <NoNavLayout>
    <AccountLayout>
        {page}
    </AccountLayout>
</NoNavLayout>

ChangePassword.permission = [PERMISSIONS.ACCOUNT.CHANGE_PASSWORD.VIEW]  
