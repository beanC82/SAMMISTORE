import { NextPage } from 'next'
import { lazy, Suspense } from 'react'
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'
//views
// Dynamically import the ListProduct component
const ListProduct = lazy(() => import('src/view/pages/manage-product/product/ListProduct'))

type TProps = {}

const Product: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ListProduct />
        </Suspense>
    )
}

Product.permission = [PERMISSIONS.MANAGE_PRODUCT.PRODUCT.VIEW]
export default Product

