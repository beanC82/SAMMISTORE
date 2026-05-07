import * as React from 'react';
import Box from '@mui/material/Box';
import { useTranslation } from '../../../node_modules/react-i18next';
import { PaginationProps, Select, styled } from '@mui/material';
import { MenuItem } from '@mui/material';
import { Pagination } from '@mui/material';


type TProps = {
    page: number,
    pageSize: number,
    rowLength: number,
    pageSizeOptions: number[],
    onChangePagination: (page: number, pageSize: number) => void,
    isHidden?: boolean
}

const StyledPagination = styled(Pagination)<PaginationProps>(({ theme }) => ({
    "& .MuiDataGrid-footerContainer": {
        ".MuiBox-root": {
            flex: 1,
            width: "100% !important"
        }
    },
    "& .MuiPagination-ul": {
    flexWrap: "nowrap",
  },
}))

const CustomPagination = React.forwardRef((props: TProps, ref: React.Ref<any>) => {
    const { page, pageSize, rowLength, pageSizeOptions, onChangePagination, isHidden, ...rests } = props

    const { t } = useTranslation();

    const pageCount = Math.ceil(rowLength / pageSize);

    const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
        onChangePagination(newPage , pageSize);
    };

    const startIndex = (page - 1 )* pageSize + 1;
    const endIndex = Math.min((page) * pageSize, rowLength);

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: "100%",
            paddingLeft: "8px"
        }}>
            {!isHidden ? (
                <>
                    {rowLength > 0 ? (
                        <Box>
                            <span>{t('Đang hiển thị ')}</span>
                            <span className='font-bold'>
                                {startIndex}
                                {' - '}
                            </span>
                            <span className='font-bold'>
                                {endIndex}
                            </span>
                            <span> trên </span>
                            <span className='font-bold'>{rowLength}</span>
                        </Box>
                    ) : (
                        <Box></Box>
                    )}
                </>
            ) : (<Box></Box>)}
            <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
            }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <span>Số dòng hiển thị</span>
                    <Select
                        size='small'
                        sx={{
                            width: '80px',
                            padding: 0,
                            '& .MuiSelect-select.MuiSelect-outlined.MuiInputBase-input.MuiOutlinedInput-input MuiInputBase-inputSizeSmall': {
                                minWidth: 'unset !important',
                                padding: "8.5px 12px 8.5px 24px !important"
                            }
                        }}
                        value={pageSize}
                        onChange={e => onChangePagination(1, +e.target.value)}
                    >
                        {pageSizeOptions.map((opt) => {
                            return (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            )
                        })}
                    </Select>
                </Box>
                <StyledPagination color='primary' count={pageCount} page={page}
                    siblingCount={1}
                    boundaryCount={1}
                    showFirstButton
                    showLastButton
                    onChange={handlePageChange}
                    {...rests} />
            </Box>
        </Box>
    );
})

export default CustomPagination