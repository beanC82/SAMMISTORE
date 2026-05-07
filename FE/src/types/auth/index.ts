export type TLoginAuth = {
    username: string;
    password: string;
    rememberMe?: boolean;
    returnUrl?: string;
    isEmployee?: boolean;
};

export type TRegisterAuth = {
    firstName: string,
    lastName: string,
    phone: string,
    username: string,
    email: string,
    password: string,
    rePassword: string
}

export type TChangePassword = {
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
}

export interface LoginParams {
    username: string;
    password: string;
    rememberMe?: boolean;
    returnUrl?: string;
    isEmployee?: boolean;
}

export type TUpdateProfile = {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    gender: number,
    birthday: Date
}

export interface UserDataType {
    id: number;
    username: string
  }

export type ErrCallbackType = (err: any) => void;

export interface AuthValuesType {
    user: UserDataType | null;
    loading: boolean;
    setUser: (user: UserDataType | null) => void;
    setLoading: (loading: boolean) => void;
    login: (params: LoginParams, errorCallback?: ErrCallbackType) => void;
    logout: () => void;
}