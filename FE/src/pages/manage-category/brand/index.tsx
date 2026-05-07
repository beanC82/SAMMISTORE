import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
//views
const ListBrand = lazy(() => import('src/view/pages/manage-category/brand/ListBrand'))

type TProps = {}

const Brand: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<></>}>
            <ListBrand />
        </Suspense>
    )
}

Brand.permission = [PERMISSIONS.MANAGE_PRODUCT.BRAND.VIEW]
export default Brand

