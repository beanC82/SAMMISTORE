import NoNavLayout from 'src/view/layout/NoNavLayout'
import dynamic from 'next/dynamic'

const InternalServerError = dynamic(() => import('src/view/pages/500'), {
  loading: () => null,
  ssr: false
})

const Error500 = () => {
  return <InternalServerError />
}

export default Error500
Error500.getLayout = (page: React.ReactNode) =><NoNavLayout>{page}</NoNavLayout>