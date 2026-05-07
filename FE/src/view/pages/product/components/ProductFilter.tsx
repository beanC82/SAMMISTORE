import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import { Box, BoxProps, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { FormControl, FormLabel } from '@mui/material';
import { REVIEW_PRODUCT_FILTER } from 'src/configs/product';
import { IconButton } from '@mui/material';
import IconifyIcon from 'src/components/Icon';
import { Tooltip } from '@mui/material';


interface TProductFilter {
    handleProductFilter: (value: string, type: string) => void
    cityOptions: {
        label: string,
        value: string
    }[]
    handleReset: () => void
    selectedLocation: string
    selectedReview: string
}

const StyledProductFilter = styled(Box)<BoxProps>(({ theme }) => ({
    padding: "10px",
    border: `1px solid ${theme.palette.customColors.borderColor}`,
    height: 'fit-content',
    borderRadius: "15px",
    backgroundColor: theme.palette.background.paper
}));

const ProductFilter = (props: TProductFilter) => {

    //props
    const { handleProductFilter, cityOptions, selectedLocation, selectedReview, handleReset } = props

    //state

    //translation
    const { t } = useTranslation()

    //theme
    const theme = useTheme();

    const listReviewProduct = REVIEW_PRODUCT_FILTER()

    const onChangeFilter = (value: string, type: string) => {
        handleProductFilter(value, type)
    }

    const handleResetFilter = () => {
        handleReset()
    }

    return (
        <StyledProductFilter sx={{ width: "100%", padding: 4 }}>
            {Boolean(selectedLocation || selectedReview) && (
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                    <Tooltip title={t("reset_filter")}>
                        <IconButton onClick={() => handleResetFilter()}>
                            <IconifyIcon icon="mdi:delete-outline" />
                        </IconButton>
                    </Tooltip>
                </Box>
            )}
            <Box>
                <FormControl>
                    <FormLabel id="radio-review-group" sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main
                    }}>{t("review")}</FormLabel>
                    <RadioGroup
                        aria-labelledby="radio-review-group"
                        name="radio-review-group"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeFilter(e.target.value, "review")}
                    >
                        {listReviewProduct.map((review) => {
                            return (
                                <FormControlLabel
                                    key={review.value}
                                    value={review.value}
                                    control={<Radio checked={review.value === selectedReview} />}
                                    label={review.label}
                                />
                            )
                        })}
                    </RadioGroup>
                </FormControl>
            </Box>
            <Box sx={{ mt: 2 }}>
                <FormControl>
                    <FormLabel id="radio-review-group" sx={{
                        fontWeight: "bold",
                        color: theme.palette.primary.main
                    }}>{t("location")}</FormLabel>
                    <RadioGroup
                        aria-labelledby="radio-review-group"
                        name="radio-review-group"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChangeFilter(e.target.value, "location")}
                    >
                        {cityOptions.map((city) => {
                            return (
                                <FormControlLabel
                                    key={city.value}
                                    value={city.value}
                                    control={<Radio checked={city.value === selectedLocation} />}
                                    label={city.label}
                                />
                            )
                        })}
                    </RadioGroup>
                </FormControl>
            </Box>
        </StyledProductFilter>
    )
}

export default ProductFilter