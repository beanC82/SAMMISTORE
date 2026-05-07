"use client"

import { NextPage } from "next"
import { useState } from "react";

//MUI
import { Box, Container, CssBaseline, Toolbar, } from "@mui/material";

//views
import VerticalLayout from "./VerticalLayout";
import HorizontalLayout from "./HorizontalLayout";
import { useTheme } from "@mui/material";
import Image from "next/image";
import FloatingChatBot from "src/components/floating-chat-bot";


type TProps = {
    children: React.ReactNode
}

const UserLayout: NextPage<TProps> = ({ children }) => {
    const [open, setOpen] = useState(true)

    const theme = useTheme()
    const toggleDrawer = () => {
        setOpen(!open)
    }
    return (
        <Box sx={{ display: 'flex'}}>
            <CssBaseline />
            <VerticalLayout open={open} toggleDrawer={toggleDrawer}/>
            <HorizontalLayout open={open} toggleDrawer={toggleDrawer}  showIcon={true} />
            <Box
                component='main'
                sx={{
                    backgroundColor:
                        theme => theme.palette.mode === 'light'
                            ? theme.palette.grey[100]
                            // ? theme.palette.background.paper
                            : theme.palette.grey[900],
                    flexGrow: 1,
                    height: 'fit-content',
                    overflow: 'hidden',
                }}
            >
                <Toolbar />
                <Container sx={{
                    m: 4,
                    width: `calc(100% - 32px)`,
                    maxWidth: `calc(100% - 32px) !important`,
                    overflow: "auto",
                    // minHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - 32px)`,
                    // maxHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - 64px)`,
                    // height: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - 32px)`,
                    height: 'fit-content',
                    p: "0 !important",
                    borderRadius: "15px"
                }}>
                    {children}
                </Container>
            </Box>
            <FloatingChatBot />
        </Box >
    )
}

export default UserLayout