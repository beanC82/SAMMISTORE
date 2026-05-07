// ** React Imports
import { ReactNode, useState } from 'react'

// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'
import type { NextPage } from 'next'
import type { AppProps } from 'next/app'

// ** Store Imports
import { Provider } from 'react-redux'

// ** Loader Import
import NProgress from 'nprogress'

// ** Config Imports
import 'src/configs/i18n'
import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'

// ** Contexts
import { AuthProvider } from 'src/contexts/AuthContext'

// ** Global css styles
import 'src/styles/globals.scss'

// ** Configure NProgress
NProgress.configure({ 
  minimum: 0.3,
  easing: 'ease',
  speed: 200,
  showSpinner: false,
  trickleSpeed: 100
})

import { store } from 'src/stores'
import GuestGuard from 'src/components/auth/GuestGuard'
import AuthGuard from 'src/components/auth/AuthGuard'
import { SettingsConsumer, SettingsProvider } from 'src/contexts/SettingsContext'
import AclGuard from 'src/components/auth/AclGuard'

import CustomToastContainer from 'src/components/react-toastify'
import { useSettings } from 'src/hooks/useSettings'
import ThemeComponent from 'src/theme/ThemeComponent'
import UserLayout from 'src/view/layout/UserLayout'
import { AxiosInterceptor } from 'src/helpers/axios'
import NoGuard from 'src/components/auth/NoGuard'

// ** React Query
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Spinner from 'src/components/spinner'

type ExtendedAppProps = AppProps & {
  Component: NextPage
}

type GuardProps = {
  authGuard: boolean
  guestGuard: boolean
  children: ReactNode
}

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }: GuardProps) => {
  if (guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <NoGuard fallback={<Spinner />}>{children}</NoGuard>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

export default function App(props: ExtendedAppProps) {
  const { Component, pageProps } = props

  const { settings } = useSettings()

  const [queryClient] = useState(() => new QueryClient())

  // Variables
  const getLayout = Component.getLayout ?? (page => <UserLayout>{page}</UserLayout>)

  const setConfig = Component.setConfig ?? undefined

  const authGuard = Component.authGuard ?? false

  const guestGuard = Component.guestGuard ?? false

  const aclAbilities = Component.acl ?? defaultACLObj

  const permission = Component.permission ?? []

  return (
    <Provider store={store}>
      <Head>
        <title>{`${themeConfig.templateName} - Cửa hàng mỹ phẩm Sammi`}</title>
        <meta
          name='description'
          content={`${themeConfig.templateName} – Cửa hàng mỹ phẩm Sammi`}
        />
        <meta name='keywords' content='Cửa hàng mỹ phẩm Sammi, Sammi Stores' />
        <meta name='viewport' content='initial-scale=1, width=device-width' />
      </Head>

      <QueryClientProvider client={queryClient}>
        {/* <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' /> */}
        <AuthProvider>
          <AxiosInterceptor>
            <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
              <SettingsConsumer>
                {({ settings }) => {
                  return (
                    <ThemeComponent settings={settings}>
                      <Guard authGuard={authGuard} guestGuard={guestGuard}>
                        <AclGuard permission={permission} aclAbilities={aclAbilities} guestGuard={guestGuard} authGuard={authGuard}>
                          {getLayout(<Component {...pageProps} />)}
                        </AclGuard>
                      </Guard>
                      <CustomToastContainer />
                    </ThemeComponent>
                  ) 
                }}
              </SettingsConsumer>
            </SettingsProvider>
          </AxiosInterceptor>
        </AuthProvider>
      </QueryClientProvider>
    </Provider>
  )
}
