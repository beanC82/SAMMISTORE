// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, ErrCallbackType, UserDataType } from './types'
import { getLoginUser, loginAuth, loginAdminAuth } from 'src/services/auth'
import { removeLocalUserData, setLocalUserData, setTemporaryToken } from 'src/helpers/storage'
import instance from 'src/helpers/axios'
import { toast } from 'react-toastify'
import { updateProductToCart } from 'src/stores/order'
import { AppDispatch } from 'src/stores'
import { useDispatch } from 'react-redux'
import { LoginParams } from 'src/types/auth'
import { useTranslation } from 'react-i18next'
import { ROUTE_CONFIG } from 'src/configs/route'
import { resetInitialState } from 'src/stores/cart'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  loginAdmin: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  const { t } = useTranslation()

  //redux
  const dispatch: AppDispatch = useDispatch()

  useEffect(() => {
    const initAuth = async (): Promise<void> => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName);
      if (storedToken) {
        setLoading(true);
        try {
          instance.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const response = await getLoginUser();
          setUser({ ...response.result });
          setLoading(false);
        } catch (error) {
          removeLocalUserData();
          delete instance.defaults.headers.common['Authorization'];
          setUser(null);
          setLoading(false);
          if (!router.pathname.includes('login')) {
            router.replace('/login');
          }
        }
      } else {
        setLoading(false);
      }
    }

    initAuth()
  }, [])

  const handleLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    setLoading(true);
    try {
      const response = await loginAuth({
        username: params.username,
        password: params.password,
        rememberMe: params.rememberMe || true,
        returnUrl: params.returnUrl,
        isEmployee: params.isEmployee,
      });

      const accessToken = response.result?.accessToken;
      if (!accessToken) throw new Error('No access token received');

      instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const userResponse = await getLoginUser();
      setUser({ ...userResponse.result });

      const userData = userResponse.result;
      // if (params.rememberMe) {
      if (true) {
        setLocalUserData(
          JSON.stringify(userData || {}),
          accessToken,
          response.result?.refreshToken || null
        );
      } else {
        setTemporaryToken(accessToken);
      }

      toast.success(t('login_success'));
      const returnUrl = params.returnUrl || router.query.returnUrl || '/';
      const redirectURL = returnUrl !== '/' ? returnUrl : '/';
      router.replace(redirectURL as string);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (errorCallback) errorCallback(err);
      toast.error(err?.response?.data?.message || t('login_error'));
    }
  };

  const handleAdminLogin = async (params: LoginParams, errorCallback?: ErrCallbackType) => {
    setLoading(true);
    try {
      const response = await loginAdminAuth({
        username: params.username,
        password: params.password,
        rememberMe: params.rememberMe,
        returnUrl: params.returnUrl,
        isEmployee: params.isEmployee,
      });

      const accessToken = response.result?.accessToken;
      if (!accessToken) throw new Error('No access token received');

      instance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const userResponse = await getLoginUser();
      setUser({ ...userResponse.result });

      const userData = userResponse.result;
      // if (params.rememberMe) {
      if (true) {
        setLocalUserData(
          JSON.stringify(userData || {}),
          accessToken,
          response.result?.refreshToken || null
        );
      } else {
        setTemporaryToken(accessToken);
      }

      toast.success(t('login_success'));
      const returnUrl = params.returnUrl || router.query.returnUrl || ROUTE_CONFIG.DASHBOARD;
      const redirectURL = returnUrl !== ROUTE_CONFIG.DASHBOARD ? returnUrl : ROUTE_CONFIG.DASHBOARD;
      router.replace(redirectURL as string);
      setLoading(false);
    } catch (err: any) {
      setLoading(false);
      if (errorCallback) errorCallback(err);
      console.log(err)
      toast.error(err?.response?.data?.message || t('login_error'));
    }
  };

  

  // const handleLogout = () => {
  //   logoutAuth().then((res) => {
  //     setUser(null)
  //     removeLocalUserData()
  //     delete instance.defaults.headers.common['Authorization'];
  //     dispatch(updateProductToCart({
  //       orderItems: []
  //     }))
  //     if (!LIST_PUBLIC_PAGE?.some((item) => router.asPath.includes(item))) {
  //       if (router.asPath !== '/') {
  //         router.replace({
  //           pathname: '/login',
  //           query: {
  //             returnUrl: router.asPath
  //           }
  //         })
  //       } else {
  //         router.replace('/login')
  //       }
  //     }
  //   })
  // }

  const handleLogout = () => {

    setUser(null)
    removeLocalUserData()
    delete instance.defaults.headers.common['Authorization'];
    dispatch(resetInitialState())

    window.location.href = '/login'
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    loginAdmin: handleAdminLogin
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
