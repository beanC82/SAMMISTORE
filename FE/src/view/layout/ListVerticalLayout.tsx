"use client"

import React, { useEffect, useMemo, lazy, Suspense } from "react";
import { NextPage } from "next"
import { useRouter } from "next/router";
import Link from "next/link";

// MUI - optimized imports
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText, { ListItemTextProps } from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip";
import { styled, useTheme } from "@mui/material/styles";

//components
const IconifyIcon = lazy(() => import("src/components/Icon"));
import { TVerticalLayoutItem, VerticalLayoutItems } from "src/configs/layout";
import { hexToRGBA } from "src/utils/hex-to-rgba";
import { PERMISSIONS } from "src/configs/permission";
import { useAuth } from "src/hooks/useAuth";
import Spinner from "src/components/spinner";
type TProps = {
    open: boolean
}

type TListItem = {
    level: number,
    openItem: {
        [key: string]: boolean
    }
    items: any
    setOpenItem: React.Dispatch<React.SetStateAction<{
        [key: string]: boolean
    }>>
    disabled: boolean
    setActivePath: React.Dispatch<React.SetStateAction<string | null>>
    activePath: string | null
}

interface TListItemText extends ListItemTextProps {
    active: boolean,
    hasActiveChild?: boolean
    isOpen?: boolean
    isParent?: boolean
}

const StyledListItemText = styled(ListItemText, {
    shouldForwardProp: (prop) => prop !== 'active' && prop !== 'hasActiveChild' && prop !== 'isOpen' && prop !== 'isParent',
})<TListItemText>(({ theme, active, hasActiveChild, isOpen, isParent }) => ({
    ".MuiTypography-root.MuiTypography-body1.MuiListItemText-primary": {
        textOverflow: "ellipsis",
        overflow: "hidden",
        display: "block",
        width: "100%",

        color: isOpen
            ? (hasActiveChild ? theme.palette.primary.main : theme.palette.primary.main)
            : (isParent
                ? ((hasActiveChild ? theme.palette.primary.main : theme.palette.text.primary)
                    || (active
                        ? theme.palette.common.white
                        : theme.palette.text.primary)
                )
                : (active
                    ? theme.palette.common.white
                    : theme.palette.text.primary)),
        fontWeight: active ? 600 : 400
    }
}))

const RecursiveListItem: NextPage<TListItem> = ({ level, openItem, items, setOpenItem, disabled, activePath, setActivePath }) => {

    const theme = useTheme()
    const router = useRouter()

    const handleClick = (title: string) => {
        if (!disabled) {
            setOpenItem(prev => ({
                // ...prev,
                [title]: !prev[title]
            }))
        }
    }

    const handleSelectItem = (path: string) => {
        setActivePath(path)
    }
    
    const hasActiveChild = (item: TVerticalLayoutItem): boolean => {
        if (!item.children) {
            return item.path === activePath
        }
        return item.children.some((item: TVerticalLayoutItem) => hasActiveChild(item))
    }

    const isActiveItem = (item: TVerticalLayoutItem): boolean => {
        return item.path === activePath || !!openItem[item.title] || hasActiveChild(item)
    }

    return (
        <>
            {items?.map((item: any) => {
                const activeParent = hasActiveChild(item)
                const isActive = isActiveItem(item)

                return (
                    <React.Fragment key={item.title}>
                        {item.path ? (
                            <Link href={item.path} passHref legacyBehavior>
                                <ListItemButton
                                    component="a"
                                    sx={{
                                        padding: `8px 25px 8px ${level * (level === 1 ? 15 : 15)}px !important`,
                                        margin: "2px 8px 2px 0px",
                                        borderTopRightRadius: "30px",
                                        borderBottomRightRadius: "30px",
                                        background:
                                            isActive
                                                ? item.path === activePath
                                                    ? `linear-gradient(135deg, ${hexToRGBA(theme.palette.secondary.main, 0.8)} 0%, ${hexToRGBA(theme.palette.primary.main, 0.8)} 100%)`
                                                    : `${hexToRGBA(theme.palette.primary.main, 0.08)}`
                                                : theme.palette.background.paper,
                                    }}
                                    onClick={(e) => {
                                        if (item.children) {
                                            e.preventDefault()
                                            handleClick(item.title)
                                        }
                                        if (item.path) {
                                            handleSelectItem(item.path)
                                        }
                                    }}
                                >
                                    <ListItemIcon>
                                        <Box sx={{
                                            borderRadius: "8px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "30px",
                                            height: "30px",
                                            color:
                                                isActive
                                                    ? `${theme.palette.primary.main} !important`
                                                    : theme.palette.background.paper,
                                        }}>
                                            <Suspense fallback={<Spinner />}>
                                                <IconifyIcon icon={item.icon}
                                                    style={{
                                                        color: item.children
                                                            ? openItem[item.title] || hasActiveChild(item)
                                                                ? theme.palette.primary.main
                                                                : theme.palette.text.primary
                                                            : isActive
                                                                ? theme.palette.common.white
                                                                : theme.palette.text.primary
                                                    }} />
                                            </Suspense>
                                        </Box>
                                    </ListItemIcon>
                                    {!disabled && (
                                        <Tooltip title={item?.title}>
                                            <StyledListItemText
                                                primary={item?.title}
                                                active={isActive}
                                                hasActiveChild={!!item.children?.length && hasActiveChild(item)}
                                                isOpen={openItem[item.title]}
                                                isParent={!!item.children}
                                            />
                                        </Tooltip>
                                    )}
                                    {item?.children && item?.children.length > 0 && (
                                        <>
                                            {openItem[item.title] ? (
                                                <Suspense fallback={<Spinner />}>
                                                    <IconifyIcon icon='weui:arrow-outlined'
                                                        style={{
                                                            color:
                                                                isActive
                                                                    ? theme.palette.primary.main
                                                                    : `rgba(${theme.palette.customColors.main}, 0.78)`,
                                                            transform: 'rotate(90deg)',
                                                            transition: "transform 0.3s ease",
                                                        }} />
                                                </Suspense>
                                            )
                                                : (
                                                    <Suspense fallback={<Spinner />}>
                                                        <IconifyIcon icon='weui:arrow-outlined'
                                                            style={{
                                                                color:
                                                                    isActive
                                                                        ? `${theme.palette.primary.main}`
                                                                        : `rgba(${theme.palette.customColors.main}, 0.78)`,
                                                                transition: "transform 0.3s ease",
                                                            }}
                                                        />
                                                    </Suspense>
                                                )
                                            }
                                        </>
                                    )}
                                </ListItemButton>
                            </Link>
                        ) : (
                            <ListItemButton
                                sx={{
                                    padding: `8px 25px 8px ${level * (level === 1 ? 15 : 15)}px !important`,
                                    margin: "2px 8px 2px 0px",
                                    borderTopRightRadius: "30px",
                                    borderBottomRightRadius: "30px",
                                    background:
                                        isActive
                                            ? item.path === activePath
                                                ? `linear-gradient(135deg, ${hexToRGBA(theme.palette.secondary.main, 0.8)} 0%, ${hexToRGBA(theme.palette.primary.main, 0.8)} 100%)`
                                                : `${hexToRGBA(theme.palette.primary.main, 0.08)}`
                                            : theme.palette.background.paper,
                                }}
                                onClick={() => {
                                    if (item.children) {
                                        handleClick(item.title)
                                    }
                                }}
                            >
                                <ListItemIcon>
                                    <Box sx={{
                                        borderRadius: "8px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: "30px",
                                        height: "30px",
                                        color:
                                            isActive
                                                ? `${theme.palette.primary.main} !important`
                                                : theme.palette.background.paper,
                                    }}>
                                        <Suspense fallback={<Spinner />}>
                                            <IconifyIcon icon={item.icon}
                                                style={{
                                                    color: item.children
                                                        ? openItem[item.title] || hasActiveChild(item)
                                                            ? theme.palette.primary.main
                                                            : theme.palette.text.primary
                                                        : isActive
                                                            ? theme.palette.common.white
                                                            : theme.palette.text.primary
                                                }} />
                                        </Suspense>
                                    </Box>
                                </ListItemIcon>
                                {!disabled && (
                                    <Tooltip title={item?.title}>
                                        <StyledListItemText
                                            primary={item?.title}
                                            active={isActive}
                                            hasActiveChild={!!item.children?.length && hasActiveChild(item)}
                                            isOpen={openItem[item.title]}
                                            isParent={!!item.children}
                                        />
                                    </Tooltip>
                                )}
                                {item?.children && item?.children.length > 0 && (
                                    <>
                                        {openItem[item.title] ? (
                                                <Suspense fallback={<Spinner />}>
                                                <IconifyIcon icon='weui:arrow-outlined'
                                                    style={{
                                                        color:
                                                            isActive
                                                                ? theme.palette.primary.main
                                                                : `rgba(${theme.palette.customColors.main}, 0.78)`,
                                                        transform: 'rotate(90deg)',
                                                        transition: "transform 0.3s ease",
                                                    }} />
                                            </Suspense>
                                        )
                                            : (
                                                <Suspense fallback={<Spinner />}>
                                                    <IconifyIcon icon='weui:arrow-outlined'
                                                        style={{
                                                            color:
                                                                isActive
                                                                    ? `${theme.palette.primary.main}`
                                                                    : `rgba(${theme.palette.customColors.main}, 0.78)`,
                                                            transition: "transform 0.3s ease",
                                                        }}
                                                    />
                                                </Suspense>
                                            )
                                        }
                                    </>
                                )}
                            </ListItemButton>
                        )}
                        {
                            item.children && item.children.length > 0 && (
                                <Collapse in={openItem[item.title]} timeout="auto" unmountOnExit>
                                    <RecursiveListItem
                                        level={level + 1}
                                        openItem={openItem}
                                        items={item.children}
                                        setOpenItem={setOpenItem}
                                        disabled={disabled}
                                        activePath={activePath}
                                        setActivePath={setActivePath}
                                    />
                                </Collapse>
                            )
                        }
                    </React.Fragment>
                )
            })}
        </>
    )
}

// Dynamically import the main component to optimize initial load time
const ListVerticalLayout: NextPage<TProps> = ({ open }) => {
    const [openItem, setOpenItem] = React.useState<{ [key: string]: boolean }>({})
    const [activePath, setActivePath] = React.useState<null | string>('')

    const ListVerticalItem = VerticalLayoutItems()

    //router
    const router = useRouter()

    //auth
    const { user } = useAuth()

    //permission
    const permissionUser = user?.role?.permissions
        ? user?.role?.permissions.includes(PERMISSIONS.BASIC)
            ? [PERMISSIONS.DASHBOARD]
            : user?.role?.permissions
        : []

    const findParentActivePath = (items: TVerticalLayoutItem[], activePath: string) => {
        for (const item of items) {
            if (item.path === activePath) {
                return item.title
            }
            if (item.children && item.children.length > 0) {
                const child: any = findParentActivePath(item.children, activePath)
                if (child) {
                    return item.title
                }
            }
        }
        return null
    }


    const hasPermission = (item: any, permissionUser: string[]) => {
        return permissionUser.includes(item.permission)
            || !item.permission
    }

    const filterMenuByPermission = (menu: any[], permissionUser: string[]) => {
        if (menu) {
            return menu.filter((item) => {
                if (hasPermission(item, permissionUser)) {
                    if (item.children && item.children.length > 0) {
                        item.children = filterMenuByPermission(item.children, permissionUser)
                    }
                    if (!item?.children?.length && !item.path) {
                        return false
                    }
                    return true
                }
                return false
            })
        }
        return []
    }


    //set open item in menu
    useEffect(() => {
        if (!open) {
            handleToggleAll()
            setOpenItem({})
        }
    }, [open])

    const memoFilterMenu = useMemo(() => {
        if (permissionUser.includes(PERMISSIONS.ADMIN)) {
            return ListVerticalItem
        }
        return filterMenuByPermission(ListVerticalItem, permissionUser)
    }, [ListVerticalItem, permissionUser])

    //active path in menu
    useEffect(() => {
        if (router.asPath) {
            const parentTitle = findParentActivePath(memoFilterMenu, router.asPath)
            if (parentTitle) {
                setOpenItem({
                    [parentTitle]: true,
                })
            }
            setActivePath(router.asPath)
        }
    }, [router.asPath])

    const handleToggleAll = () => {
        setOpenItem({})
    }

    return (
        <List
            sx={{
                width: '100%',
                maxWidth: 360,
                bgcolor: 'background.paper',
                padding: 0
            }}
            component='nav'
        >
            <RecursiveListItem
                level={1}
                openItem={openItem}
                items={memoFilterMenu}
                setOpenItem={setOpenItem}
                disabled={!open}
                activePath={activePath}
                setActivePath={setActivePath}
            />
        </List>
    )
}

export default ListVerticalLayout