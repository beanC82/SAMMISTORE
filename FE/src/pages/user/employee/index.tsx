import { NextPage } from 'next'
import { lazy, Suspense } from 'react'

//configs
import { PERMISSIONS } from 'src/configs/permission'
import Spinner from 'src/components/spinner'

//Pages
const ListEmployeePage = lazy(() => import('src/view/pages/user/employee/ListEmployee'))

type TProps = {}

const Employee: NextPage<TProps> = () => {
    return (
        <Suspense fallback={<Spinner />}>
            <ListEmployeePage />
        </Suspense>
    )
}

Employee.permission = [PERMISSIONS.USER.EMPLOYEE.VIEW]
export default Employee

