export type TParamsGetAllRoles = {
    limit?: number,
    page?: number,
    search?: string,
    order?: string
}

export type TParamsCreateRole = {
    name: string,
    permissions?: string[]
}

export type TParamsUpdateRole = {
    name: string,
    id: number,
    permissions?: string[]
}

export type TParamsDeleteRole = {
    name: string,
    id: number,
}
