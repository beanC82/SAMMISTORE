import { NextPage, GetStaticProps, GetStaticPaths } from 'next'
import { lazy, Suspense } from 'react'
import Spinner from 'src/components/spinner'
import NoNavLayout from 'src/view/layout/NoNavLayout'
import { getProductDetail } from 'src/services/product'
import { fetchStaticData, getRevalidationTime } from 'src/utils/staticFetching'

//views
// const ProductDetailPage = lazy(() => import('src/view/pages/product/ProductDetail'))
interface ProductDetailPageProps {
    initialData: any;
  }
  
  const ProductDetailPage = lazy(
    () => import('src/view/pages/product/ProductDetail')
  ) as React.LazyExoticComponent<React.FC<ProductDetailPageProps>>;

type TProps = {
    productData: any
}

const ProductDetail: NextPage<TProps> = ({ productData }) => {
    return (
        <Suspense fallback={<Spinner />}>
            <ProductDetailPage initialData={productData} />
        </Suspense>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    // You can pre-render the most popular products here
    // For example, fetch the top 20 most viewed products
    return {
        paths: [], // No pre-rendered paths - will be generated on-demand
        fallback: 'blocking', // Show a loading state until the page is generated
    }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
    const productId = params?.productId
    
    // Use the helper function for fetching with error handling
    const productData = await fetchStaticData(
        async (id: number) => {
            const response = await getProductDetail(id)
            return response?.result || null
        },
        null, // Fallback value if fetch fails
        Number(productId)
    )
    
    return {
        props: {
            productData,
        },
        // Use appropriate revalidation time for products
        revalidate: getRevalidationTime('product'),
    }
}

export default ProductDetail

ProductDetail.getLayout = (page: React.ReactNode) => <NoNavLayout>{page}</NoNavLayout>
ProductDetail.authGuard = false
ProductDetail.guestGuard = false
