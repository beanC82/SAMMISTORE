"use client"

//React
import React, { useCallback, useEffect, useRef, useState } from 'react'

//Next
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'

//MUI
import { Button, Grid, useTheme } from '@mui/material'
import { Box } from '@mui/material'
import { GridColDef, GridRowClassNameParams, GridSortModel } from '@mui/x-data-grid'

//redux
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/stores'
import { resetInitialState } from 'src/stores/role'
import { deleteRoleAsync, getAllRolesAsync, updateRoleAsync } from 'src/stores/role/action'

//translation
import { useTranslation } from '../../../../../node_modules/react-i18next'

//configs
import { PAGE_SIZE_OPTIONS } from 'src/configs/gridConfig'

//components
import CustomDataGrid from 'src/components/custom-data-grid'
import CustomPagination from 'src/components/custom-pagination'
import GridUpdate from 'src/components/grid-update'
import GridDelete from 'src/components/grid-delete'
import GridCreate from 'src/components/grid-create'
import SearchField from 'src/components/search-field'
import CreateUpdateRole from './components/CreateUpdateRole'
import Spinner from 'src/components/spinner'

//toast
import { toast } from 'react-toastify'
import ConfirmDialog from 'src/components/confirm-dialog'
import IconifyIcon from 'src/components/Icon'
import TablePermission from './components/TablePermission'
import { deleteRole, getRoleDetail } from 'src/services/role'
import { PERMISSIONS } from 'src/configs/permission'
import { getAllValuesOfObject } from 'src/utils'
import { hexToRGBA } from 'src/utils/hex-to-rgba'
import { usePermission } from 'src/hooks/usePermission'
import { OBJECT_TYPE_ERROR } from 'src/configs/error'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from 'src/configs/queryKey'
import { useMutationEditRole } from 'src/queries/role'
import { useGetListRoles } from 'src/queries/role'


type TProps = {}

const ListRolePage: NextPage<TProps> = () => {


    //States
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [openCreateUpdateRole, setOpenCreateUpdateRole] = useState({
        open: false,
        id: ""
    });
    const [openDeleteRole, setOpenDeleteRole] = useState({
        open: false,
        id: ""
    });
    const [sortBy, setSortBy] = useState("created asc");
    const [searchBy, setSearchBy] = useState("");
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [selectedRow, setSelectedRow] = useState({
        id: "",
        name: ""
    });
    const [loading, setLoading] = useState(false);
    const [disablePermission, setDisablePermission] = useState(false);
    const { VIEW, CREATE, UPDATE, DELETE } = usePermission("SYSTEM.ROLE", ["CREATE", "UPDATE", "DELETE", "VIEW"]);

    //router
    const router = useRouter();

    //Translation
    const { t } = useTranslation();

    const queryClient = useQueryClient()

    //Redux
    const { isSuccessCreateUpdate, isErrorCreateUpdate, isLoading,
        errorMessageCreateUpdate, isSuccessDelete, isErrorDelete, errorMessageDelete, typeError } = useSelector((state: RootState) => state.role)
    const dispatch: AppDispatch = useDispatch();

    // ** Ref
    const refActionGrid = useRef<boolean>(false)

    //Theme
    const theme = useTheme();

    const fetchRole = async (searchBy: string, sortBy: string) => {
        const res = await getAllRolesAsync({ params: { limit: -1, page: -1, search: searchBy, order: sortBy } })
        return res
    }

    // ** fetch api
    const fetchDeleteRole = async (id: number) => {
        const res = await deleteRole(id)

        return res?.data
    }

    const { isPending: isLoadingEdit, mutate: mutateEditRole } = useMutationEditRole({
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [queryKeys.role_list, sortBy, searchBy, -1, -1] })
            toast.success(t('Update_role_success'))
        },
        onError: () => {
            toast.success(t('Update_role_error'))
        }
    })

    const handleUpdateRole = () => {
        mutateEditRole({ name: selectedRow.name, id: Number(selectedRow.id), permissions: selectedPermissions })
    }

    const { data: rolesList, isPending } = useGetListRoles(
        { limit: -1, page: -1, search: searchBy, order: sortBy },
        {
            select: data => data?.roles,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            staleTime: 10000 // thời gian mà dữ liệu được coi là còn mới, sau thời gian này thì dữ liệu sẽ được fetch lại
        }
    )

    const { isPending: isLoadingDelete, mutate: mutateDeleteRole } = useMutation({
        mutationFn: fetchDeleteRole,
        mutationKey: [queryKeys.delete_role],
        onSuccess: () => {
            queryClient.refetchQueries({ queryKey: [queryKeys.role_list, sortBy, searchBy, -1, -1] })
            handleCloseDeleteDialog()
            toast.success(t('Delete_role_success'))
        },
        onError: () => {
            toast.success(t('Delete_role_error'))
        }
    })

    //api 
    const handleGetListRole = () => {
        dispatch(getAllRolesAsync({ params: { limit: -1, page: -1, search: searchBy, order: sortBy } }));
    }

    //handlers

    const handleOnChangePagination = (page: number, pageSize: number) => { }

    const handleSort = (sort: GridSortModel) => {
        const sortOption = sort[0]
        setSortBy(`${sortOption.field} ${sortOption.sort}`)
    }

    const handleCloseCreateUpdateRole = useCallback(() => {
        setOpenCreateUpdateRole({
            open: false,
            id: ""
        })
        refActionGrid.current = false
    }, [])

    const handleCloseDeleteDialog = useCallback(() => {
        setOpenDeleteRole({
            open: false,
            id: ""
        })
        refActionGrid.current = false
    }, [])

    const handleDeleteRole = () => {
        dispatch(deleteRoleAsync(Number(openDeleteRole.id)))
    }

    const handleGetRoleDetail = async (id: number) => {
        setLoading(true)
        await getRoleDetail(id).then((res) => {
            if (res?.data) {
                if (res?.data.permissions.includes(PERMISSIONS.ADMIN)) {
                    setDisablePermission(true)
                    setSelectedPermissions(getAllValuesOfObject(PERMISSIONS, [PERMISSIONS.ADMIN, PERMISSIONS.BASIC]))
                } else if (res?.data.permissions.includes(PERMISSIONS.BASIC)) {
                    setDisablePermission(true)
                    setSelectedPermissions(PERMISSIONS.DASHBOARD)
                }
                else {
                    setDisablePermission(false)
                    setSelectedPermissions(res?.data?.permissions || [])
                }
            }
            setLoading(false)
        }).catch((e) => {
            setLoading(false)
        })
    }

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: t('name'),
            flex: 1
        },
        {
            field: 'action',
            headerName: t('action'),
            width: 150,
            sortable: false,
            align: "left",
            renderCell: (params) => {
                const { row } = params
                return (
                    <Box sx={{ width: "100%" }}>
                        {!row?.permissions?.some((per: string) => ['ADMIN.GRANTED', 'BASIC.PUBLIC']?.includes(per)) ? (
                            <>
                                <GridUpdate
                                    disabled={!UPDATE}
                                    onClick={() => {
                                        refActionGrid.current = true
                                        setOpenCreateUpdateRole({
                                            open: true,
                                            id: String(params.id)
                                        })
                                    }}
                                />
                                <GridDelete
                                    disabled={!DELETE}

                                    onClick={() => {
                                        refActionGrid.current = true
                                        setOpenDeleteRole({
                                            open: true,
                                            id: String(params.id)
                                        })
                                    }
                                    }
                                />
                            </>
                        ) : (
                            <Box sx={{ paddingLeft: "5px" }}>
                                <IconifyIcon icon="material-symbols-light:lock-outline" fontSize={30} />
                            </Box>
                        )}
                    </Box>
                )
            }
        },
    ];

    const PaginationComponent = () => {
        return <CustomPagination
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onChangePagination={handleOnChangePagination}
            page={page}
            rowLength={rolesList.length} />
    };

    useEffect(() => {
        // handleGetListRole();
    }, [sortBy, searchBy])

    useEffect(() => {
        if (selectedRow.id) {
            handleGetRoleDetail(Number(selectedRow.id))
        }
    }, [selectedRow])

    useEffect(() => {
        if (isSuccessCreateUpdate) {
            if (!openCreateUpdateRole.id) {
                toast.success(t("create_role_success"))
            } else {
                toast.success(t("update_role_success"))
            }
            handleGetListRole()
            handleCloseCreateUpdateRole()
            dispatch(resetInitialState())
        } else if (isErrorCreateUpdate && errorMessageCreateUpdate && typeError) {
            const errConfig = OBJECT_TYPE_ERROR[typeError]
            if (errConfig) {
                toast.error(t(errConfig))
            } else {
                if (openCreateUpdateRole.id) {
                    toast.error(t("update_role_error"))
                } else {
                    toast.error(t("create_role_error"))
                }
            }
            dispatch(resetInitialState())
        }
    }, [isSuccessCreateUpdate, isErrorCreateUpdate, errorMessageCreateUpdate, typeError])

    useEffect(() => {
        if (isSuccessDelete) {
            toast.success(t("delete_role_success"))
            handleGetListRole()
            dispatch(resetInitialState())
            handleCloseDeleteDialog()
        } else if (isErrorDelete && errorMessageDelete) {
            toast.error(errorMessageDelete)
            dispatch(resetInitialState())
        }
    }, [isSuccessDelete, isErrorDelete, errorMessageDelete])

    return (
        <>
            {isPending && <Spinner />}
            <ConfirmDialog
                open={openDeleteRole.open}
                onClose={handleCloseDeleteDialog}
                handleCancel={handleCloseDeleteDialog}
                handleConfirm={handleDeleteRole}
                title={"Xác nhận xóa nhóm vai trò"}
                description={"Bạn có chắc xóa nhóm vai trò này không?"}
            />
            <CreateUpdateRole
                idRole={openCreateUpdateRole.id}
                open={openCreateUpdateRole.open}
                onClose={handleCloseCreateUpdateRole}
                sortBy={sortBy}
                searchBy={searchBy}
            />

            <Box sx={{
                backgroundColor: theme.palette.background.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                height: 'fit-content',
            }}>
                <Grid container sx={{ width: '100%', height: '100%' }} spacing={5}>
                    <Grid item md={4} xs={12}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 4,
                        }}>
                            <Box sx={{
                                width: '200px',
                            }}>
                                <SearchField value={searchBy} onChange={(value: string) => setSearchBy(value)} />
                            </Box>
                            <GridCreate onClick={() => {
                                setOpenCreateUpdateRole({ open: true, id: "" })
                            }}
                                addText={t("add_role")}
                            />
                        </Box>
                        <CustomDataGrid
                            rows={rolesList}
                            columns={columns}
                            pageSizeOptions={[5]}
                            // checkboxSelection
                            getRowId={(row) => row._id}
                            disableRowSelectionOnClick
                            autoHeight
                            hideFooter
                            sortingOrder={['desc', 'asc']}
                            sortingMode='server'
                            onSortModelChange={handleSort}
                            slots={{
                                pagination: PaginationComponent
                            }}
                            disableColumnFilter
                            disableColumnMenu
                            onRowClick={row => {
                                if (!refActionGrid.current) {
                                    setSelectedRow({ id: String(row.id), name: row?.row?.name })
                                }
                            }}
                            getRowClassName={(row: GridRowClassNameParams) => {
                                return row.id === selectedRow.id ? 'selected-row' : ''
                            }}
                            sx={{
                                ".selected-row": {
                                    backgroundColor: `${hexToRGBA(theme.palette.primary.main, 0.08)} !important`,
                                    color: `${theme.palette.primary.main} !important`
                                }
                            }}
                        />
                    </Grid>
                    <Grid item md={8} xs={12}>
                        {selectedRow?.id && (
                            <>
                                <Box>
                                    <TablePermission
                                        setSelectedPermissions={setSelectedPermissions}
                                        selectedPermissions={selectedPermissions}
                                        disabled={disablePermission}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            type='submit'
                                            disabled={disablePermission}
                                            variant='contained'
                                            sx={{ mt: 3, mb: 2 }}
                                            onClick={handleUpdateRole} >
                                            {t('update')}
                                        </Button>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </Grid>
                </Grid>
            </Box >
        </>
    )
}

export default ListRolePage
