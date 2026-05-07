// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Imports
import { useRouter } from 'next/router'

// ** Configs
import { ACCESS_TOKEN, USER_DATA } from 'src/configs/auth'

// ** Helpers
import { getTemporaryToken, removeLocalUserData, removeTemporaryToken } from 'src/helpers/storage'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const authContext = useAuth()
  const router = useRouter()

  useEffect(() => {
    const { temporaryToken } = getTemporaryToken()
    if (!router.isReady) {
      return
    }
    if (authContext.user === null
      && !window.localStorage.getItem(ACCESS_TOKEN)
      && !window.localStorage.getItem(USER_DATA)
      && !temporaryToken
    ) {
      if (router.asPath !== '/' && router.asPath !== '/login') {
        router.push({
          pathname: '/login',
          query: { returnUrl: router.asPath }
        })
      } else {
        router.replace('/login')
      }
      authContext.setUser(null)
      removeLocalUserData()
    }
  }, [router.route])

  useEffect(() => {
    const handleUnload = () => {
      removeTemporaryToken()
    }
    window.addEventListener('beforeunload', handleUnload)
    return () => {
      window.removeEventListener('beforeunload', handleUnload)
    }
  }, [])

  // if (authContext.loading || authContext.user === null) {
  //   return fallback
  // }

  return <>{children}</>
}

export default AuthGuard
