import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'

//views
import BlankLayout from 'src/view/layout/BlankLayout'
import Spinner from 'src/components/spinner'
const LoginPage = dynamic(() => import('src/view/pages/login'), {
    ssr: false
})

type TProps = {}

const Login: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <LoginPage />
        </Suspense>
    )
}

export default Login

Login.getLayout = (page: React.ReactNode) => <BlankLayout>{page}</BlankLayout>
Login.guestGuard = true
