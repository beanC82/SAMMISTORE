import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
//views
// Dynamically import the ListBanner component
const ListBanner = lazy(() => import('src/view/pages/manage-category/banner/ListBanner'))

type TProps = {}

const Banner: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<></>}>
            <ListBanner />
        </Suspense>
    )
}

export default Banner

Banner.permission = [PERMISSIONS.SETTING.BANNER.VIEW]

