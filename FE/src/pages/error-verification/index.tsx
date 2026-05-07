import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import NoNavLayout from 'src/view/layout/NoNavLayout'

//views
const ErrorVerificationPage = lazy(() => import('src/view/pages/error-verification'))

type TProps = {}

const ErrorVerification: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ErrorVerificationPage />
        </Suspense>
    )
}

export default ErrorVerification

ErrorVerification.getLayout = (page: React.ReactNode) => <NoNavLayout>{page}</NoNavLayout>

