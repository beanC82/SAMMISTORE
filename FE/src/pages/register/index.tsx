import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
//views
import BlankLayout from 'src/view/layout/BlankLayout'
// Dynamically import the Register component
const RegisterPage = lazy(() => import('src/view/pages/register'))

type TProps = {}

const Register: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <RegisterPage />
        </Suspense>
    )
}

export default Register

Register.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>
Register.guestGuard = true