export type ErrCallbackType = (err: any) => void

export type LoginParams = {
  username: string
  password: string
  rememberMe?: boolean
}

export type TUserAddress ={
  id: number;
  streetAddress: string;
  wardId: number;
  isDefault: boolean;
}

// export type UserDataType = {
//   _id: string
//   role: {
//     name: string,
//     permissions: string[]
//   }
//   email: string
//   fullName: string
//   firstName: string
//   middleName: string
//   lastName: string
//   username: string
//   password: string
//   avatar?: string | null
//   likedProducts: string[]
//   city: string,
//   address?: string,
//   phoneNumber: string
//   addresses: TUserAddress[]
// }

export type UserDataType = {
  id: number
  code: string
  identityGuid: string
  type: string
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string
  streetAddress?: string
  wardId: number
  wardName: string
  districtId: number
  districtName: string
  provinceId: number
  provinceName: string
  username: string
  gender: number
  displayOrder: number

  role?: {
    name: string
    permissions: string[]
  }
}

export type AuthValuesType = {
  loading: boolean
  logout: () => void
  user: UserDataType | null
  setLoading: (value: boolean) => void
  setUser: (value: UserDataType | null) => void
  login: (params: LoginParams, errorCallback?: ErrCallbackType) => void
  loginAdmin: (params: LoginParams, errorCallback?: ErrCallbackType) => void
}
