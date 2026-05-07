"use client"

import Box from "@mui/material/Box"
import { styled } from "@mui/material/styles"
import type { BoxProps } from "@mui/material"
import type { NextPage } from "next"

type TProps = {
    children: React.ReactNode
}

const BlankLayoutWrapper = styled(Box)<BoxProps>(() =>({
    height: '100vh',
}))

const BlankLayout: NextPage<TProps> = ({ children }) => {
    return (
        <BlankLayoutWrapper>
            <Box sx={{
                overflow: 'hidden',
                minHeight: '100vh',
            }} >
                {children}
            </Box>
        </BlankLayoutWrapper>
    )
}

export default BlankLayout