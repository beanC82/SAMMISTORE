import { UseMutationOptions } from './../../../node_modules/@tanstack/react-query/src/types'
import { useMutation, useQuery, UseQueryOptions } from '@tanstack/react-query'
import { queryKeys } from 'src/configs/queryKey'
import { getAllRoles, updateRole } from 'src/services/role'
import { TParamsGetAllRoles, TParamsUpdateRole } from 'src/types/role'

export const useGetListRoles = (
  params: TParamsGetAllRoles,
  options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: [queryKeys.role_list, params.order, params.search, params.limit, params.page],
    queryFn: async () => {
      const res = await getAllRoles({ params: { ...params } })

      return res.data
    },
    ...options
  })
}

export const useMutationEditRole = (
    options?: Omit<UseMutationOptions<any, unknown, TParamsUpdateRole>, 'mutationKey' | 'mutationFn'>
) => {
  return useMutation({
    mutationFn: async data => {
      const res = await updateRole(data)

      return res.data
    },
    mutationKey: [queryKeys.update_role],
    ...options
  })
}
