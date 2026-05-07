export type TParamsGetAllUsers = {
    limit?: number,
    page?: number,
    search?: string,
    order?: string
}

export type TParamsCreateUser = {
    firstName?: string,
    middleName?: string,
    lastName?: string,
    email: string,
    password?: string,
    phoneNumber?: string,
    role: string,
    city?: string,
    address?: string,
    status?: number,
    avatar?: string
}

export type TParamsUpdateUser = {
    id: number,
    firstName?: string,
    middleName?: string,
    lastName?: string,
    email: string,
    password?: string,
    phoneNumber?: string,
    role: string,
    city?: string,
    address?: string,
    status?: number,
    avatar?: string
}

export type TParamsDeleteUser = {
    name: string,
    id: number,
}

export type TParamsDeleteMultipleUsers = {
    userIds: number[],
}