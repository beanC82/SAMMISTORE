// ** React
import React, { useState, useEffect, lazy, Suspense } from 'react'

// ** Next
import { useTranslation } from 'react-i18next'

// ** Mui Imports
import IconButton from '@mui/material/IconButton'

// ** Hooks
import { Box, Menu, MenuItem } from '@mui/material'

// ** config
import { LANGUAGE_OPTIONS } from 'src/configs/i18n'
import Spinner from 'src/components/spinner'
// Dynamic import
const ReactCountryFlag = lazy(() => import('react-country-flag'))

type TProps = {}

const countryCode = {
  en: 'GB',
  vi: 'VN'
}

const FlagFallback = () => <Spinner />

const LanguageDropdown = (props: TProps) => {
  // ** State
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  // ** Hooks
  const { i18n } = useTranslation()
  const open = Boolean(anchorEl)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleOnchangeLang = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  if (!isMounted) {
    return null
  }

  return (
    <Box>
      <IconButton
        onClick={handleOpen}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          borderRadius: '50%'
        }}
      >
        <Suspense fallback={<FlagFallback />}>
          <ReactCountryFlag
            style={{ height: '26px', width: '26px', borderRadius: '50%', objectFit: 'cover' }}
            className='country-flag flag-icon'
            countryCode={(countryCode as any)[i18n.language]}
            svg
          />
        </Suspense>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        id='language-dropdown'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {LANGUAGE_OPTIONS.map(lang => {
          return (
            <MenuItem
              key={lang.value}
              selected={i18n.language === lang.value}
              onClick={() => {
                handleClose()
                handleOnchangeLang(lang.value)
              }}
              sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Suspense fallback={<FlagFallback />}>
                <ReactCountryFlag
                  className='country-flag flag-icon'
                  countryCode={(countryCode as any)[lang.value]}
                  svg
                  style={{ position: 'relative', top: '0px' }}
                />
              </Suspense>
              {lang.language}
            </MenuItem>
          )
        })}
      </Menu>
    </Box>
  )
}

export default LanguageDropdown
