import React from "react";
import axios from "axios";
import { BASE_URL, API_ENDPOINT } from '../../configs/api';
import { getLocalUserData, getTemporaryToken, removeLocalUserData, removeTemporaryToken, setLocalUserData, setTemporaryToken } from "../storage";
import { jwtDecode } from 'jwt-decode'
import { NextRouter, useRouter } from "next/router";
import { UserDataType } from "src/contexts/types";
import { useAuth } from "src/hooks/useAuth";

type TAxiosInterceptor = {
    children: React.ReactNode
}

const instance = axios.create({ 
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
})

const handleRedirectToLogin = (router: NextRouter, setUser: (data: UserDataType | null) => void) => {
    if (router.asPath !== '/' && router.asPath !== '/login-admin') {
        router.replace({
            pathname: '/login',
            query: {
                returnUrl: router.asPath
            }
        })
    } else if (router.asPath === '/') {
        router.replace('/login')
    }
    setUser(null)
    removeLocalUserData()
    removeTemporaryToken()
}

const AxiosInterceptor: React.FC<TAxiosInterceptor> = ({ children }) => {
    const router = useRouter()
    const { setUser, user } = useAuth()

    instance.interceptors.request.use(async (config) => {
        const { accessToken, refreshToken } = getLocalUserData()
        const { temporaryToken } = getTemporaryToken()
        const isPublicApi = config?.params?.isPublic

        if (accessToken || temporaryToken) {
            let decodedAccessToken: any = {}
            if (accessToken) {
                decodedAccessToken = jwtDecode(accessToken)
            } 
            // else if (temporaryToken) {
            //     decodedAccessToken = jwtDecode(temporaryToken)
            // }
            if (decodedAccessToken?.exp > Date.now() / 1000) {
                config.headers.Authorization = `Bearer ${accessToken}`
            } else {
                if (refreshToken) {
                    const decodedRefreshToken: any = jwtDecode(refreshToken)
                    if (decodedRefreshToken?.exp > Date.now() / 1000) {
                        //call api return new access token
                        await axios.post(`${API_ENDPOINT.AUTH.INDEX}/refreshtoken`, { refreshToken }, {
                            headers: {
                                Authorization: `Bearer ${refreshToken ? accessToken : temporaryToken}`
                            }
                        }).then((response) => {
                            const newAccessToken = response?.data?.data?.access_token
                            if (newAccessToken) {
                                config.headers.Authorization = `Bearer ${newAccessToken}`
                                if (accessToken) {
                                    setLocalUserData(JSON.stringify(user), newAccessToken, refreshToken)
                                }
                                else {   
                                    setLocalUserData(JSON.stringify(user), "", refreshToken)
                                    setTemporaryToken(newAccessToken)
                                }
                            } else {
                                handleRedirectToLogin(router, setUser)
                            }
                        }).catch(() => {
                            handleRedirectToLogin(router, setUser)
                        })
                    } else {
                        handleRedirectToLogin(router, setUser)
                    }
                } else {
                    handleRedirectToLogin(router, setUser)
                }
            }
        } else if (!isPublicApi) {
            handleRedirectToLogin(router, setUser)
        }
        return config
    })

    instance.interceptors.response.use((response) => {
        return response
    })
    return <>{children}</>
}
export default instance
export { AxiosInterceptor }