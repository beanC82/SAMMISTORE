import * as React from 'react';
import { emphasize, styled } from '@mui/material/styles';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ReactElement;
    onDelete?: () => void;
}

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor =
        theme.palette.mode === 'light'
            ? theme.palette.grey[100]
            : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &:focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
}) as typeof Chip;


interface CustomBreadcrumbsProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    ariaLabel?: string;
}

// Custom Breadcrumbs Component
const CustomBreadcrumbs = ({ items, separator = '/', ariaLabel = 'breadcrumb' }: CustomBreadcrumbsProps) => {
    return (
        <Breadcrumbs aria-label={ariaLabel} separator={separator}>
            {items.map((item, index) => (
                <StyledBreadcrumb
                    key={index}
                    component={item.href ? 'a' : 'div'}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    onDelete={item.onDelete}
                    deleteIcon={item.onDelete ? <ExpandMoreIcon /> : undefined}
                />
            ))}
        </Breadcrumbs>
    );
};

export default CustomBreadcrumbs;