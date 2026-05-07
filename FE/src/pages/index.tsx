'use client'
import Head from 'next/head'
import { lazy, Suspense } from 'react'
import NoNavLayout from 'src/view/layout/NoNavLayout'
import { GetStaticProps } from 'next'
import { fetchStaticData, getRevalidationTime } from 'src/utils/staticFetching'


// Define type for home page data
interface HomePageProps {
  initialData: any;
}

// Dynamically import the Home component
const HomePage = lazy(() => import('src/view/pages/home'))

export default function Home({ initialData }: HomePageProps) {
  return (
    <>
      <Head>
        <title>Sammi Stores</title>
        <meta name='description' content='Cửa hàng mỹ phẩm Sammi' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {/* <meta httpEquiv='Content-Security-Policy' content="default-src 'self'; script-src 'self'" /> */}
        <link rel='icon' href='/favicon.icon' />
      </Head>
      <Suspense fallback={<></>}>
        <HomePage initialData={initialData} />
      </Suspense>
    </>
  )
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  // Use the helper function for fetching home page data with error handling
  // Example implementation - replace with actual service calls for your homepage
  const homeData = await fetchStaticData(
    async () => {
      // const featuredProducts = await getAllProducts();
      // const categories = await getCategories();
      // return { featuredProducts, categories };
      
      return {}; 
    },
    {}, 
  );
  
  return {
    props: {
      initialData: homeData,
    },

    revalidate: getRevalidationTime('home'),
  }
}

Home.getLayout = (page: React.ReactNode) => <NoNavLayout>{page}</NoNavLayout>
Home.guestGuard = false
Home.authGuard = false