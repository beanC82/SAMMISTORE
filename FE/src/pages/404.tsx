// ** React Imports
import NoNavLayout from 'src/view/layout/NoNavLayout'
import dynamic from 'next/dynamic'

const NotFound = dynamic(() => import('src/view/pages/404'), {
  loading: () => null,
  ssr: false
})

const Error404 = () => {
  return <NotFound />
}

export default Error404
Error404.getLayout = (page: React.ReactNode) =><NoNavLayout>{page}</NoNavLayout>
