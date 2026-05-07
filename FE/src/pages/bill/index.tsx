import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import NoNavLayout from 'src/view/layout/NoNavLayout'
import Spinner from 'src/components/spinner'
//views
import BillPage from '@/view/pages/bill'



type TProps = {}

const Bill: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <BillPage />
        </Suspense>
    )
}

export default Bill

Bill.getLayout = (page: React.ReactNode) => <NoNavLayout>{page}</NoNavLayout>

