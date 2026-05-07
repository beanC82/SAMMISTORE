import { PERMISSIONS } from "src/configs/permission"
import { useAuth } from "./useAuth"
import { useEffect, useState } from "react"

type TAction = "VIEW" | "CREATE" | "UPDATE" | "DELETE"

export const usePermission = (key: string, actions: TAction[]) => {
    const { user } = useAuth()
    const defaultValue = {
        VIEW: false,
        CREATE: false,
        UPDATE: false,
        DELETE: false
    }

    const getObjectValue = (obj: any, key: string) => {
        const keys = key.split('.')
        let result = obj
        if (keys && !!key.length) {
            for (const k of keys) {
                if (k in obj) {
                    result = result[k]
                } else {
                    return undefined
                }
            }
        }
        return result
    }
    const userPermission = user?.role?.permissions

    const [permission, setPermission] = useState(defaultValue)
    useEffect(() => {
        const mapPermission = getObjectValue(PERMISSIONS, key)
        actions.forEach((mode) => {
            if (userPermission?.includes(PERMISSIONS.ADMIN)) {
                defaultValue[mode] = true
            }else if (userPermission?.includes(mapPermission[mode])) {
                defaultValue[mode] = true
            }else {
                defaultValue[mode] = false
            }
        })
        setPermission(defaultValue)
    }, [user?.role])

    return permission
}