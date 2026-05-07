
//Mui
import { Typography, useTheme } from "@mui/material"
import { GridRenderCellParams } from "@mui/x-data-grid"

//translation
import { useTranslation } from "../../../../../../node_modules/react-i18next"

//redux
import { useDispatch } from "react-redux"
import { AppDispatch } from "src/stores"
import CustomDataGrid from "src/components/custom-data-grid";
import { GridColDef } from "@mui/x-data-grid";
import { LIST_PERMISSION_DATA, PERMISSIONS } from "src/configs/permission";
import { Checkbox } from "@mui/material"
import { getAllValuesOfObject } from "src/utils"

interface TTablePermission {
    selectedPermissions: string[],
    setSelectedPermissions: React.Dispatch<React.SetStateAction<string[]>>,
    disabled: boolean
}

const TablePermission = (props: TTablePermission) => {

    //props
    const { selectedPermissions, setSelectedPermissions, disabled } = props

    //translation
    const { t } = useTranslation()

    //theme
    const theme = useTheme()

    //redux
    const dispatch: AppDispatch = useDispatch()

    //handler 
    const getPermissionValue = (value: string, mode: string, parentValue?: string) => {
        try {
            return parentValue ? PERMISSIONS[parentValue][value][mode] : PERMISSIONS[value]
        } catch (error) {
            return ""
        }
    }

    const handleOnChangeCheckBox = (value: string) => {
        const isChecked = selectedPermissions.includes(value)
        if (isChecked) {
            setSelectedPermissions(selectedPermissions.filter(item => item !== value))
        } else {
            setSelectedPermissions([...selectedPermissions, value])
        }
    }

    const handleIsChecked = (value: string, parentValue?: string) => {
        const allValue = parentValue
            ? getAllValuesOfObject(PERMISSIONS[parentValue][value])
            : getAllValuesOfObject(PERMISSIONS[value])
        const isCheckedAll = allValue.every(item => selectedPermissions.includes(item))
        return {
            isChecked: isCheckedAll,
            allValue: allValue
        }
    }

    const handleCheckAllCheckbox = (value: string, parentValue?: string) => {
        const { isChecked: isCheckedAll, allValue } = handleIsChecked(value, parentValue)
        if (isCheckedAll) {
            const filtered = selectedPermissions.filter(item => !allValue.includes(item))
            setSelectedPermissions(filtered)
        } else {
            setSelectedPermissions([...new Set([...selectedPermissions, ...allValue])])
        }
    }

    const handleCheckAllGroupCheckbox = (value: string) => {
        const { isChecked: isCheckedAll, allValue } = handleIsChecked(value)
        if (isCheckedAll) {
            const filtered = selectedPermissions.filter(item => !allValue.includes(item))
            setSelectedPermissions(filtered)
        } else {
            setSelectedPermissions([...new Set([...selectedPermissions, ...allValue])])
        }
    }


    const columns: GridColDef[] = [
        {
            field: 'all',
            // headerName: t('all'),
            minWidth: 80,
            maxWidth: 80,
            sortable: false,
            renderCell(params: GridRenderCellParams) {
                const { row } = params
                const { isChecked, allValue } = handleIsChecked(row?.value, row?.parentValue)
                return (
                    <>
                        {!row?.isHideCheckAll && (
                            <Checkbox disabled={disabled} checked={isChecked} value={row?.value} onChange={e => {
                                if (row.isParent) {
                                    handleCheckAllGroupCheckbox(e.target.value)
                                }
                                else {
                                    handleCheckAllCheckbox(e.target.value, row?.parentValue)
                                }
                            }
                            } />
                        )}
                    </>
                )
            },
        },
        {
            field: 'name',
            headerName: t('name'),
            flex: 1,
            minWidth: 120,
            sortable: false,
            renderCell(params: GridRenderCellParams) {
                const { row } = params
                return <Typography sx={{
                    color: row?.isParent ? theme.palette.primary.main : `rgba(${theme.palette.customColors.main}, 0.78)`,
                    paddingLeft: row?.isParent ? 0 : theme.spacing(4),
                    textTransform: row?.isParent ? 'uppercase' : 'normal'
                }}>
                    {t(row?.name)}
                </Typography>
            }
        },
        {
            field: 'view',
            headerName: t('view'),
            minWidth: 80,
            maxWidth: 80,
            sortable: false,
            renderCell(params: GridRenderCellParams) {
                const { row } = params
                const value = getPermissionValue(row?.value, 'VIEW', row?.parentValue)
                return (
                    <>
                        {!row?.isHideView && !row?.isParent && (
                            <Checkbox
                                value={value}
                                disabled={disabled}
                                onChange={e => {
                                    handleOnChangeCheckBox(e.target.value)
                                }}
                                checked={selectedPermissions.includes(value)}
                            />
                        )}
                    </>
                )
            },
        },
        {
            field: 'create',
            headerName: t('create'),
            minWidth: 80,
            maxWidth: 80,
            sortable: false,
            renderCell(params: GridRenderCellParams) {
                const { row } = params
                const value = getPermissionValue(row?.value, 'CREATE', row?.parentValue)
                return (
                    <>
                        {!row?.isHideCreate && !row?.isParent && (
                            <Checkbox
                                value={value}
                                disabled={disabled}
                                onChange={e => {
                                    handleOnChangeCheckBox(e.target.value)
                                }}
                                checked={selectedPermissions.includes(value)}
                            />
                        )}
                    </>
                )
            },
        },
        {
            field: 'update',
            headerName: t('update'),
            minWidth: 120,
            maxWidth: 120,
            sortable: false,
            renderCell(params: GridRenderCellParams) {
                const { row } = params
                const value = getPermissionValue(row?.value, 'UPDATE', row?.parentValue)
                return (
                    <>
                        {!row?.isHideUpdate && !row?.isParent && (
                            <Checkbox
                                value={value}
                                disabled={disabled}
                                onChange={e => {
                                    handleOnChangeCheckBox(e.target.value)
                                }}
                                checked={selectedPermissions.includes(value)}
                            />
                        )}
                    </>
                )
            },
        },
        {
            field: 'delete',
            headerName: t('delete'),
            minWidth: 80,
            maxWidth: 80,
            sortable: false,
            renderCell(params: GridRenderCellParams) {
                const { row } = params
                const value = getPermissionValue(row?.value, 'DELETE', row?.parentValue)
                return (
                    <>
                        {!row?.isHideDelete && !row?.isParent && (
                            <Checkbox
                                value={value}
                                disabled={disabled}
                                onChange={e => {
                                    handleOnChangeCheckBox(e.target.value)
                                }}
                                checked={selectedPermissions.includes(value)}
                            />
                        )}
                    </>
                )
            },
        },
    ];

    return (
        <>
            <CustomDataGrid
                rows={LIST_PERMISSION_DATA}
                columns={columns}
                disableRowSelectionOnClick
                autoHeight
                hideFooter
                disableColumnFilter
                disableColumnMenu
            />
        </>
    )
}

export default TablePermission