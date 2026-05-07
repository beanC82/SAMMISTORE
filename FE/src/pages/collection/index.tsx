import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import NoNavLayout from 'src/view/layout/NoNavLayout'
import Spinner from 'src/components/spinner'
//views
// Dynamically import the Collection component
const CollectionPage = lazy(() => import('src/view/pages/collection/all'))

type TProps = {}

const Collection: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <CollectionPage />
        </Suspense>
    )
}

export default Collection

Collection.getLayout = (page: React.ReactNode) => <NoNavLayout>{page}</NoNavLayout>

