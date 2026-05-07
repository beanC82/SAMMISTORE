import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'

//views
const ListEventPage = lazy(() => import('src/view/pages/manage-promotion/event/ListEvent'))

type TProps = {}

const Event: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ListEventPage />
        </Suspense>
    )
}

export default Event

Event.permission = [PERMISSIONS.MANAGE_PROMOTION.EVENT.VIEW]
