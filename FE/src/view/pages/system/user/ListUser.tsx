"use client"

//React
import React, { useEffect, useMemo, useState } from 'react'

//Next
import { NextPage } from 'next'
import { useRouter } from 'next/navigation'

//MUI
import { Chip, ChipProps, Grid, Typography, useTheme } from '@mui/material'
import { Box } from '@mui/material'
import { GridColDef, GridRenderCellParams, GridRowClassNameParams, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid'

//redux
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from 'src/stores'

//translation
import { useTranslation } from 'react-i18next'

//configs
import { PAGE_SIZE_OPTIONS } from 'src/configs/gridConfig'

//components
import CustomDataGrid from 'src/components/custom-data-grid'
import CustomPagination from 'src/components/custom-pagination'
import GridUpdate from 'src/components/grid-update'
import GridDelete from 'src/components/grid-delete'
import GridCreate from 'src/components/grid-create'
import SearchField from 'src/components/search-field'
import CreateUpdateUser from './components/CreateUpdateUser'
import Spinner from 'src/components/spinner'

//toast
import { toast } from 'react-toastify'
import ConfirmDialog from 'src/components/confirm-dialog'
import { OBJECT_TYPE_ERROR } from 'src/configs/error'

//utils
import { formatFilter, toFullName } from 'src/utils'
import { hexToRGBA } from 'src/utils/hex-to-rgba'


import { usePermission } from 'src/hooks/usePermission'
import { deleteMultipleUsersAsync, deleteUserAsync, getAllUsersAsync } from 'src/stores/user/action'
import { resetInitialState } from 'src/stores/user'
import TableHeader from 'src/components/table-header'
import { PERMISSIONS } from 'src/configs/permission'
import { styled } from '@mui/material'
import CustomSelect from 'src/components/custom-select'
import { getAllRoles } from 'src/services/role'
import { OBJECT_USER_STATUS } from 'src/configs/user'


type TProps = {}

type TSelectedRow = {
    id: string,
    role: {
        name: string,
        permissions: string[]
    }
}

const StyledActiveUser = styled(Chip)<ChipProps>(({ theme }) => ({
    backgroundColor: "#28c76f29",
    color: "#28c76f",
    fontSize: "14px",
    padding: "8px 4px",
    fontWeight: 600
}))

const StyledInactiveUser = styled(Chip)<ChipProps>(({ theme }) => ({
    backgroundColor: "#da251d29",
    color: "#da251d",
    fontSize: "14px",
    padding: "8px 4px",
    fontWeight: 600
}))


const ListUserPage: NextPage<TProps> = () => {
    //States
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
    const [openCreateUpdateUser, setOpenCreateUpdateUser] = useState({
        open: false,
        id: ""
    });
    const [openDeleteUser, setOpenDeleteUser] = useState({
        open: false,
        id: ""
    });

    const [openDeleteMultipleUser, setOpenDeleteMultipleUser] = useState(false);

    const [sortBy, setSortBy] = useState("createdAt asc");
    const [searchBy, setSearchBy] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedRow, setSelectedRow] = useState<TSelectedRow[]>([]);
    const [roleOptions, setRoleOptions] = useState<{ label: string, value: string }[]>([])
    const [cityOptions, setCityOptions] = useState<{ label: string, value: string }[]>([])
    const [selectedRole, setSelectedRole] = useState<string[]>([]);
    const [selectedCity, setSelectedCity] = useState<string[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
    const [filterBy, setFilterBy] = useState<Record<string, string | string[]>>({});
    const USER_STATUS = OBJECT_USER_STATUS()

    //Translation
    const { t, i18n } = useTranslation();


    //hooks
    const { VIEW, CREATE, UPDATE, DELETE } = usePermission("SYSTEM.USER", ["CREATE", "UPDATE", "DELETE", "VIEW"]);

    //router
    const router = useRouter();

    //Redux
    const { users, isSuccessCreateUpdate, isErrorCreateUpdate, isLoading,
        errorMessageCreateUpdate, isSuccessDelete, isErrorDelete, errorMessageDelete, typeError, isSuccessDeleteMultiple, isErrorDeleteMultiple, errorMessageDeleteMultiple } = useSelector((state: RootState) => state.user)
    const dispatch: AppDispatch = useDispatch();

    //Theme
    const theme = useTheme();

    //api 
    const handleGetListUser = () => {
        const query = {
            params: { limit: pageSize, page: page, search: searchBy, order: sortBy, ...formatFilter(filterBy) }
        }
        dispatch(getAllUsersAsync(query));
    }

    const fetchAllRoles = async () => {
        setLoading(true)
        await getAllRoles({ params: { limit: -1, page: -1, search: '', order: '' } }).then((res) => {
            const data = res?.data?.roles
            if (data) {
                setRoleOptions(data?.map((item: { name: string, _id: string }) => ({
                    label: item.name,
                    value: item._id
                })))
            }
            setLoading(false)
        }).catch((err) => {
            setLoading(false)
        })
    }

    //handlers
    const handleOnChangePagination = (page: number, pageSize: number) => {
        setPage(page)
        setPageSize(pageSize)
    }

    const handleSort = (sort: GridSortModel) => {
        const sortOption = sort[0]
        if (sortOption) {
            setSortBy(`${sortOption.field} ${sortOption.sort}`)
        } else {
            setSortBy("createdAt asc")
        }
    }

    const handleCloseCreateUpdateUser = () => {
        setOpenCreateUpdateUser({
            open: false,
            id: ""
        })
    }

    const handleCloseDeleteDialog = () => {
        setOpenDeleteUser({
            open: false,
            id: ""
        })
    }

    const handleCloseDeleteMultipleDialog = () => {
        setOpenDeleteMultipleUser(false)
    }

    const handleDeleteUser = () => {
        dispatch(deleteUserAsync(Number(openDeleteUser.id)))
    }

    const handleDeleteMultipleUser = () => {
        dispatch(deleteMultipleUsersAsync({
            userIds: selectedRow?.map((item: TSelectedRow) => Number(item.id))
        }))
    }

    const handleAction = (action: string) => {
        switch (action) {
            case "delete": {
                setOpenDeleteMultipleUser(true)
            }
        }
    }

    const columns: GridColDef[] = [
        {
            field: i18n.language === "en" ? "firstName" : "lastName",
            headerName: t('full_name'),
            flex: 1,
            minWidth: 200,
            renderCell: (params: GridRenderCellParams) => {
                const { row } = params
                const fullName = toFullName(row?.lastName || "", row?.middleName || "", row?.firstName || "", i18n.language)
                return (
                    <Typography>{fullName}</Typography>
                )
            }
        },
        {
            field: 'email',
            headerName: t('email'),
            minWidth: 200,
            maxWidth: 200,
            renderCell: (params: GridRenderCellParams) => {
                const { row } = params
                return (
                    <Typography>{row?.email}</Typography>
                )
            }
        },
        {
            field: 'role',
            headerName: t('role'),
            flex: 1,
            minWidth: 200,
            maxWidth: 200,
            renderCell: (params: GridRenderCellParams) => {
                const { row } = params
                return (
                    <Typography>{row?.role?.name}</Typography>
                )
            }
        },
        {
            field: 'phoneNumber',
            headerName: t('phone_number'),
            flex: 1,
            minWidth: 200,
            maxWidth: 200,
            renderCell: (params: GridRenderCellParams) => {
                const { row } = params
                return (
                    <Typography>{row?.phoneNumber}</Typography>
                )
            }
        },
        {
            field: 'city',
            headerName: t('city'),
            flex: 1,
            minWidth: 200,
            maxWidth: 200,
            renderCell: (params: GridRenderCellParams) => {
                const { row } = params
                return (
                    <Typography>{row?.city?.name}</Typography>
                )
            }
        },
        {
            field: 'status',
            headerName: t('status'),
            flex: 1,
            minWidth: 200,
            maxWidth: 200,
            renderCell: (params: GridRenderCellParams) => {
                const { row } = params
                return (
                    <>
                        {row?.status ? (
                            <StyledActiveUser label={t('active')} />
                        ) : (
                            <StyledInactiveUser label={t('inactive')} />
                        )
                        }
                    </>
                )
            }
        },
        {
            field: 'action',
            headerName: t('action'),
            width: 150,
            sortable: false,
            align: "left",
            renderCell: (params: GridRenderCellParams) => {
                const { row } = params
                return (
                    <>
                        <GridUpdate
                            disabled={!UPDATE}
                            onClick={() => setOpenCreateUpdateUser({
                                open: true,
                                id: String(params.id)
                            })}
                        />
                        <GridDelete
                            disabled={!DELETE}
                            onClick={() => setOpenDeleteUser({
                                open: true,
                                id: String(params.id)
                            })}
                        />
                    </>
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
            rowLength={users.total}
        />
    };

    useEffect(() => {
        handleGetListUser();
    }, [sortBy, searchBy, i18n.language, page, pageSize, filterBy]);

    useEffect(() => {
        setFilterBy({ roleId: selectedRole, status: selectedStatus, cityId: selectedCity });
    }, [selectedRole, selectedStatus, selectedCity]);

    useEffect(() => {
        fetchAllRoles();
    }, []);

    /// create update user
    useEffect(() => {
        if (isSuccessCreateUpdate) {
            if (!openCreateUpdateUser.id) {
                toast.success(t("create_user_success"))
            } else {
                toast.success(t("update_user_success"))
            }
            handleGetListUser()
            handleCloseCreateUpdateUser()
            dispatch(resetInitialState())
        } else if (isErrorCreateUpdate && errorMessageCreateUpdate && typeError) {
            const errConfig = OBJECT_TYPE_ERROR[typeError]
            if (errConfig) {
                toast.error(t(errConfig))
            } else {
                if (openCreateUpdateUser.id) {
                    toast.error(t("update_user_error"))
                } else {
                    toast.error(t("create_user_error"))
                }
            }
            dispatch(resetInitialState())
        }
    }, [isSuccessCreateUpdate, isErrorCreateUpdate, errorMessageCreateUpdate, typeError])

    //delete multiple users
    useEffect(() => {
        if (isSuccessDeleteMultiple) {
            toast.success(t("delete_multiple_user_success"))
            handleGetListUser()
            dispatch(resetInitialState())
            handleCloseDeleteMultipleDialog()
            setSelectedRow([])
        } else if (isErrorDeleteMultiple && errorMessageDeleteMultiple) {
            toast.error(t("delete_multiple_user_error"))
            dispatch(resetInitialState())
        }
    }, [isSuccessDeleteMultiple, isErrorDeleteMultiple, errorMessageDeleteMultiple])

    const memoDisableDeleteUser = useMemo(() => {
        return selectedRow.some((item: TSelectedRow) => item?.role?.permissions?.includes(PERMISSIONS.ADMIN))
    }, [selectedRow])

    //delete user
    useEffect(() => {
        if (isSuccessDelete) {
            toast.success(t("delete_user_success"))
            handleGetListUser()
            dispatch(resetInitialState())
            handleCloseDeleteDialog()
        } else if (isErrorDelete && errorMessageDelete) {
            toast.error(errorMessageDelete)
            dispatch(resetInitialState())
        }
    }, [isSuccessDelete, isErrorDelete, errorMessageDelete])

    return (
        <>{loading && <Spinner />}
            <ConfirmDialog
                open={openDeleteUser.open}
                onClose={handleCloseDeleteDialog}
                handleCancel={handleCloseDeleteDialog}
                handleConfirm={handleDeleteUser}
                title={"Xác nhận xóa người dùng"}
                description={"Bạn có chắc xóa người dùng này không?"}
            />
            <ConfirmDialog
                open={openDeleteMultipleUser}
                onClose={handleCloseDeleteMultipleDialog}
                handleCancel={handleCloseDeleteMultipleDialog}
                handleConfirm={handleDeleteMultipleUser}
                title={"Xác nhận xóa nhiều người dùng"}
                description={"Bạn có chắc xóa các người dùng này không?"}
            />
            <CreateUpdateUser
                idUser={openCreateUpdateUser.id}
                open={openCreateUpdateUser.open}
                onClose={handleCloseCreateUpdateUser}
            />
            {isLoading && <Spinner />}
            <Box sx={{
                backgroundColor: theme.palette.background.paper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px',
                height: 'fit-content',
            }}>
                <Grid container sx={{ width: '100%', height: '100%' }}>
                    {!selectedRow?.length && (
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            mb: 4,
                            gap: 4,
                            width: '100%'
                        }}>
                            <Box sx={{ width: '200px', }}>
                                <CustomSelect
                                    fullWidth
                                    multiple
                                    value={selectedCity}
                                    options={cityOptions}
                                    onChange={(e) => setSelectedCity(e.target.value as string[])}
                                    placeholder={t('city')}
                                />
                            </Box>
                            <Box sx={{ width: '200px', }}>
                                <CustomSelect
                                    fullWidth
                                    multiple
                                    value={selectedRole}
                                    options={roleOptions}
                                    onChange={(e) => setSelectedRole(e.target.value as string[])}
                                    placeholder={t('role')}
                                />
                            </Box>
                            <Box sx={{ width: '200px', }}>
                                <CustomSelect
                                    fullWidth
                                    multiple
                                    value={selectedStatus}
                                    options={Object.values(USER_STATUS)}
                                    onChange={(e) => setSelectedStatus(e.target.value as string[])}
                                    placeholder={t('status')}
                                />
                            </Box>
                            <Box sx={{
                                width: '200px',
                            }}>
                                <SearchField value={searchBy} onChange={(value: string) => setSearchBy(value)} />
                            </Box>
                            <GridCreate onClick={() => {
                                setOpenCreateUpdateUser({ open: true, id: "" })
                            }}
                                addText={t("add_user")}
                            />
                        </Box>
                    )}
                    {selectedRow.length > 0 && (
                        <TableHeader
                            selectedRowNumber={selectedRow?.length}
                            onClear={() => setSelectedRow([])}
                            actions={
                                [{
                                    label: t("delete"),
                                    value: "delete",
                                    disabled: memoDisableDeleteUser || !DELETE
                                }]
                            }
                            handleAction={handleAction}
                        />
                    )}
                    <CustomDataGrid
                        rows={users.data}
                        columns={columns}
                        checkboxSelection
                        getRowId={(row) => row._id}
                        disableRowSelectionOnClick
                        autoHeight
                        // hideFooter
                        sortingOrder={['desc', 'asc']}
                        sortingMode='server'
                        onSortModelChange={handleSort}
                        slots={{
                            pagination: PaginationComponent
                        }}
                        disableColumnFilter
                        disableColumnMenu
                        // onRowClick={row => {
                        //     setOpenCreateUpdateUser({ open: true, id: String(row.id) })
                        // }}
                        sx={{
                            ".selected-row": {
                                backgroundColor: `${hexToRGBA(theme.palette.primary.main, 0.08)} !important`,
                                color: `${theme.palette.primary.main} !important`
                            }
                        }}
                        onRowSelectionModelChange={(row: GridRowSelectionModel) => {
                            const formatedData: any = row.map((id) => {
                                const findRow: any = users.data?.find((item: any) => item._id === id)
                                if (findRow) {
                                    return { id: findRow?._id, role: findRow?.role }
                                }
                            })
                            setSelectedRow(formatedData)
                        }}
                        rowSelectionModel={selectedRow?.map(item => item.id)}
                    />
                </Grid>
            </Box >
        </>
    )
}

export default ListUserPage
