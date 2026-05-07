
import dynamic from 'next/dynamic'
import NoNavLayout from 'src/view/layout/NoNavLayout'

const Unauthorized = dynamic(() => import('src/view/pages/403'), {
  loading: () => null,
  ssr: false
})

const Error403 = () => {
  return <Unauthorized />
}

export default Error403
Error403.getLayout = (page: React.ReactNode) =><NoNavLayout>{page}</NoNavLayout>