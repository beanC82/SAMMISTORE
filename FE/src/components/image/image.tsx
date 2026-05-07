import { forwardRef } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import Box from '@mui/material/Box';
import { alpha, useTheme } from '@mui/material/styles';

import { getRatio } from './utils';
import { ImageProps } from './types';

import Placeholder from '/public/svgs/placeholder.svg'
import Transparent from '/public/images/transparent.png'

// ----------------------------------------------------------------------

const Image = forwardRef<HTMLSpanElement, ImageProps>(
  (
    {
      ratio,
      overlay,
      disabledEffect = false,
      alt,
      src,
      threshold,
      beforeLoad,
      placeholder,
      wrapperProps,
      scrollPosition,
      effect = 'blur',
      visibleByDefault,
      wrapperClassName,
      useIntersectionObserver,
      sx,
      ...other
    },
    ref
  ) => {
    const theme = useTheme();

    const overlayStyles = !!overlay && {
      '&:before': {
        content: "''",
        top: 0,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 1,
        position: 'absolute',
        background: overlay || alpha(theme.palette.grey[900], 0.48),
      },
    };

    const content = (
      <Box
        component={LazyLoadImage}
        alt={alt}
        src={src || Placeholder}
        threshold={threshold}
        beforeLoad={beforeLoad}
        placeholder={placeholder}
        wrapperProps={wrapperProps}
        scrollPosition={scrollPosition}
        visibleByDefault={visibleByDefault}
        effect={disabledEffect ? undefined : effect}
        useIntersectionObserver={useIntersectionObserver}
        wrapperClassName={wrapperClassName || 'component-image-wrapper'}
        placeholderSrc={disabledEffect ? Transparent : Placeholder}
        sx={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          verticalAlign: 'bottom',
          ...(!!ratio && {
            top: 0,
            left: 0,
            position: 'absolute',
          }),
        }}
      />
    );

    return (
      <Box
        ref={ref}
        component="span"
        className="component-image"
        sx={{
          overflow: 'hidden',
          position: 'relative',
          verticalAlign: 'bottom',
          display: 'inline-block',
          ...(!!ratio && {
            width: '100%',
          }),
          '& span.component-image-wrapper': {
            width: '100%',
            height: '100%',
            verticalAlign: 'bottom',
            backgroundSize: 'cover !important',
            ...(!!ratio && {
              pt: getRatio(ratio),
            }),
          },
          '& img': {
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          },
          ...overlayStyles,
          ...sx,
        }}
        {...other}
      >
        {content}
      </Box>
    );
  }
);

export default Image;
