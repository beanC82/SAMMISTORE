// ** React Imports
import { useRouter } from 'next/router'
import { ReactNode } from 'react'

// ** Types
import { buildAbilityFor, type ACLObj, type AppAbility } from 'src/configs/acl'
import { useAuth } from 'src/hooks/useAuth'

// ** Components
import Error401 from 'src/pages/403'
import BlankLayout from 'src/view/layout/BlankLayout'
import { AbilityContext } from '../acl/Can'
import { PERMISSIONS } from 'src/configs/permission'


interface AclGuardProps {
  children: ReactNode
  authGuard?: boolean
  guestGuard?: boolean
  aclAbilities: ACLObj
  permission?: string[]
}

const AclGuard = (props: AclGuardProps) => {
  // ** Props
  const { aclAbilities, children, guestGuard = false, authGuard = true, permission } = props
  const router = useRouter()
  const auth = useAuth()
  const userPermission = auth.user?.role?.permissions
    ? auth.user?.role?.permissions.includes(PERMISSIONS.BASIC)
      ? [PERMISSIONS.DASHBOARD]
      : auth.user?.role?.permissions
    : []

  let ability: AppAbility
  if (auth.user && !ability) {
    ability = buildAbilityFor(userPermission, aclAbilities.subject, permission)
  }

  // ** If guestGuard or no guard is true or any error page
  if (guestGuard || router.route === "/500" || router.route === "/404" || !authGuard) {
    if (auth.user && ability) {
      return <AbilityContext.Provider value={ability} >{children}</AbilityContext.Provider>
    } else {
      return children
    }
  }

  //check the accessibility of current user

  if (ability && auth.user && ability.can(aclAbilities.action, aclAbilities.subject)) {
    return <AbilityContext.Provider value={ability} >{children}</AbilityContext.Provider>
  }

  return (
    <BlankLayout>
      <Error401 />
    </BlankLayout>
  )
}

export default AclGuard
