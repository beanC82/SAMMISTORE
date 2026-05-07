export const getTimePast = (date: Date, t: any)=> {
    const pastDate = date instanceof Date ? date : new Date(date);
    const currentDate: Date = new Date()
    const millisecondsInDay: number = 1000*60*60*24
    const millisecondsInHour: number = 1000*60*60

    if (isNaN(pastDate.getTime())) {
        console.error("Invalid date provided to getTimePast:", date);
        return t('unknown_time');
    }

    const pastTimeSecond: number = Number(currentDate.getTime() - pastDate.getTime())
    const pastTimeDay: number = pastTimeSecond / millisecondsInDay
    const pastTimeHour: number = pastTimeSecond / millisecondsInHour

    if(pastTimeDay<30){
        if(pastTimeDay<1){
            return t('just_recently')
        }
        return `${Math.floor(pastTimeDay)} ${t('days_ago')}`
    } else if(pastTimeDay<365){
        const month: number = Math.floor(pastTimeDay/30)
        return `${month} ${t('months_ago')}`
    } else{
        const year: number = Math.floor(pastTimeDay/365)
        return `${year} ${t('years_ago')}`
    }
}