import { NextPage } from 'next'
import dynamic from 'next/dynamic'
import React from 'react'

//views
import BlankLayout from 'src/view/layout/BlankLayout'

const LoginAdminPage = dynamic(() => import('src/view/pages/login-admin'), {
    ssr: false
})

type TProps = {}

const LoginAdmin: NextPage<TProps> = () => {
    return (
        <LoginAdminPage />
    )
}

export default LoginAdmin

LoginAdmin.getLayout = (page: React.ReactNode) =><BlankLayout>{page}</BlankLayout>
LoginAdmin.guestGuard = true
