"use client"

import { NextPage } from "next"

//MUI
import { Divider, IconButton, styled, Toolbar } from "@mui/material";
import MuiDrawer from '@mui/material/Drawer'
import ListVerticalLayout from "./ListVerticalLayout";
import IconifyIcon from "src/components/Icon";
import { useState } from "react";


type TProps = {
    open: boolean
    toggleDrawer: () => void
}

const drawerWidth: number = 280

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        "& .MuiDrawer-paper": {
            position: 'relative',
            marginTop: "64px",
            paddingTop: "5px",
            whiteSpace: 'nowrap',
            height: "90vh",
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
            boxSizing: 'border-box',
            ...(!open && {
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.leavingScreen,
                }),
                width: theme.spacing(18),
                [theme.breakpoints.up('sm')]: {
                    width: theme.spacing(18),
                },
            }),
        },
    }),
)

const VerticalLayout: NextPage<TProps> = ({ open, toggleDrawer }) => {
    const [isHovered, setIsHovered] = useState(false)

    const handleMouseEnter = () => {
        setIsHovered(true)
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
    }

    return (
        <Drawer variant="permanent"
            open={open || isHovered}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            {/* <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                }}>
                <IconButton onClick={toggleDrawer}>
                    <IconifyIcon icon='iconamoon:arrow-left-2' />
                </IconButton>
            </Toolbar>
            <Divider /> */}
            <ListVerticalLayout open={open || isHovered} />
        </Drawer>
    )
}

export default VerticalLayout