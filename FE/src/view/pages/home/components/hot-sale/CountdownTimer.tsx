import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface TimeLeft {
    hours: number;
    minutes: number;
    seconds: number;
}

interface CountdownTimerProps {
    saleEndTime: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ saleEndTime }) => {

    const theme = useTheme();
    const calculateTimeLeft = (): TimeLeft => {
        const difference = +new Date(saleEndTime) - +new Date();
        let timeLeft: TimeLeft = { hours: 0, minutes: 0, seconds: 0 };

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }

        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [saleEndTime]);

    const { hours, minutes, seconds } = timeLeft;
    const isSaleEnded = hours === 0 && minutes === 0 && seconds === 0;

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: 'white',
            }}
        >
            {isSaleEnded ? (
                <Typography variant="h6" color={theme.palette.error.main}>
                    Sale đã kết thúc!
                </Typography>
            ) : (
                <>
                    <Box sx={{ position: 'relative' }}>
                        <Box
                            sx={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                border: `2px solid  ${theme.palette.primary.main}`,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                backgroundColor: 'white',
                            }}
                        >
                            <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', fontSize: '1rem' }}>
                                {hours}
                            </Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontSize: '9px' }}>
                                Giờ
                            </Typography>
                        </Box>
                    </Box>

                    {/* Vòng tròn phút */}
                    <Box
                        sx={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            border: `2px solid  ${theme.palette.primary.main}`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 'bold',fontSize: '1rem' }}>
                            {minutes}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontSize: '9px' }}>
                            Phút
                        </Typography>
                    </Box>

                    {/* Vòng tròn giây */}
                    <Box
                        sx={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            border: `2px solid  ${theme.palette.primary.main}`,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="h3" sx={{ color: theme.palette.primary.main, fontWeight: 'bold', fontSize: '1rem' }}>
                            {seconds}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.primary.main, fontSize: '9px' }}>
                            Giây
                        </Typography>
                    </Box>
                </>
            )}
        </Box>
    );
};


export default CountdownTimer;