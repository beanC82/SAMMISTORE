//react
import { useEffect, useState } from "react"

//form
import { yupResolver } from "@hookform/resolvers/yup"
import { Controller, useForm } from "react-hook-form"
import * as yup from 'yup';

//Mui
import { Box, Button, IconButton, Typography } from "@mui/material"
import { useTheme } from "@mui/material"

//components
import CustomModal from "src/components/custom-modal"
import IconifyIcon from "src/components/Icon"
import Spinner from "src/components/spinner"
import CustomTextField from "src/components/text-field"

//services
import { createRole, getRoleDetail } from "src/services/role"

//translation
import { useTranslation } from "../../../../../../node_modules/react-i18next"

//redux
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/stores"
import { createRoleAsync, updateRoleAsync } from "src/stores/role/action"
import { queryKeys } from "src/configs/queryKey";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from 'react-toastify'
import { TParamsCreateRole } from "src/types/role";
import { useMutationEditRole } from "src/queries/role";
import { PERMISSIONS } from "src/configs/permission";

interface TCreateUpdateRole {
    open: boolean
    onClose: () => void
    idRole?: string
    sortBy: string
    searchBy: string
}

const CreateUpdateRole = (props: TCreateUpdateRole) => {

    //state
    const [loading, setLoading] = useState(false)

    //props
    const { open, onClose, idRole, sortBy, searchBy } = props

    const queryClient = useQueryClient()

    //translation
    const { t } = useTranslation()

    //theme
    const theme = useTheme()

    //redux
    const dispatch: AppDispatch = useDispatch()

    const schema = yup.object().shape({
        name: yup
            .string()
            .required(t('required_role_name'))
    });

    const { handleSubmit, control, formState: { errors }, reset } = useForm({
        defaultValues: {
            name: '',
        },
        mode: 'onChange',
        resolver: yupResolver(schema)
    });


    const fetchCreateRole = async (data: TParamsCreateRole) => {
        const res = await createRole(data)

        return res.data
    }

    const fetchDetailRole = async (id: number) => {
        const res = await getRoleDetail(id)
        return res?.data
    }

    const {
        isPending: isLoadingCreate,
        mutate: mutateCreateRole,
    } = useMutation({
        mutationFn: fetchCreateRole,
        mutationKey: [queryKeys.create_role],
        onSuccess: (newRole) => {
            queryClient.setQueryData([queryKeys.role_list, sortBy, searchBy, -1, -1], (oldData: any) => {

                return { ...oldData, roles: [...oldData.roles, newRole] }
            }) // thay vì refetchQueries thì update data trên cache dùng setQueryData
            onClose()
            toast.success(t('Create_role_success'))
        },
        onError: () => {
            toast.success(t('Create_role_error'))
        },
    })

    const {
        isPending: isLoadingEdit,
        mutate: mutateEditRole,
    } = useMutationEditRole({
        onSuccess: (newRole) => {
            queryClient.setQueryData([queryKeys.role_list, sortBy, searchBy, -1, -1], (oldData: any) => {
                const editedRole = oldData?.roles?.find((item: any) => item._id == newRole._id)
                if (editedRole) {
                    editedRole.name = newRole?.name
                }

                return oldData
            })
            onClose()
            toast.success(t('Update_role_success'))
        },
        onError: (errr) => {
            toast.error(t('Update_role_error'))
        },
    })

    const {
        data: roleDetail,
        isPending: isPendingRoleList,

    } = useQuery(
        {
            queryKey: [queryKeys.role_list, idRole],
            queryFn: () => fetchDetailRole(Number(idRole)),
            select: (data) => data?.roles,
            // retry: 2,
            // retryDelay: 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 5,
            initialData: [],
            placeholderData: () => {
                const roles = (queryClient.getQueryData([queryKeys.role_list, sortBy, searchBy]) as any)?.roles

                return roles?.find((item: { _id: string }) => item._id === idRole)
            },
        },
    )

    useEffect(() => {
        if (!open) {
            reset({
                name: ""
            })
        }
    }, [open, idRole])

    useEffect(() => {
        if (roleDetail) {
            reset({
                name: roleDetail?.name
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roleDetail])


    const onSubmit = (data: { name: string }) => {
        if (!Object.keys(errors)?.length) {
            if (idRole) {
                //update
                dispatch(updateRoleAsync({ name: data?.name, id: Number(idRole) }))
            } else {
                //create
                // dispatch(createRoleAsync({ name: data?.name }))
                mutateCreateRole({ name: data?.name, permissions: [PERMISSIONS.DASHBOARD] })
            }
        }
    }

    return (
        <>
            {loading && <Spinner />}
            <CustomModal open={open} onClose={onClose}>
                <Box
                    sx={{
                        backgroundColor: theme.palette.customColors.bodyBg,
                        padding: '20px',
                        borderRadius: '15px',
                    }}
                    minWidth={{ md: '400px', xs: '80vw' }}
                >
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        paddingBottom: '20px'
                    }}>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                            {idRole ? t('update_role') : t('create_role')}
                        </Typography>
                        <IconButton sx={{
                            position: 'absolute',
                            right: "-10px",
                            top: "-6px",
                        }}>
                            <IconifyIcon icon="material-symbols-light:close-rounded" fontSize={"30px"} onClick={onClose} />
                        </IconButton>
                    </Box>
                    <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' noValidate >
                        <Box sx={{
                            width: '100%',
                            backgroundColor: theme.palette.background.paper,
                            padding: '30px 20px',
                            borderRadius: '15px'
                        }}>
                            <Controller
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomTextField
                                        required

                                        fullWidth
                                        label={t("role_name")}
                                        onChange={onChange}
                                        onBlur={onBlur}
                                        value={value}
                                        placeholder={t("enter_role_name")}
                                        helperText={errors.name?.message}
                                        error={errors.name ? true : false}
                                    />
                                )}
                                name='name'
                            />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                            <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2, py: 1.5 }}>
                                {idRole ? t('update') : t('create')}
                            </Button>
                        </Box>
                    </form>
                </Box>
            </CustomModal>
        </>
    )
}

export default CreateUpdateRole