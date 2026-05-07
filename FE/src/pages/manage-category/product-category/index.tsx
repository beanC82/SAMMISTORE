import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
//views
const ListProductCategory = lazy(() => import('src/view/pages/manage-category/product-category/ListProductCategory'))

type TProps = {}

const ProductCategory: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<></>}>
            <ListProductCategory />
        </Suspense>
    )
}

ProductCategory.permission = [PERMISSIONS.MANAGE_PRODUCT.PRODUCT_CATEGORY.VIEW]
export default ProductCategory

