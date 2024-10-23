export const todayMinMaxDateTime = () => {
    const today = new Date(Date.now());
    // utc day start time 
    const min_attend_datetime = new Date(today);
    min_attend_datetime.setHours(0, 0, 0, 0);

    // utc day end time
    const max_attend_datetime = new Date(today);
    max_attend_datetime.setHours(23, 59, 59, 999);

    return { today, min_attend_datetime, max_attend_datetime };
};

export const customizeDateWithTime = (date) => {
    // if (typeof date !== 'string') return '';
    const dateObj = new Date(date)
    const formateDate_ = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: "short" })
    return formateDate_.format(dateObj)
}


export const todayMinMaxDateTimeUtcZeroFormat = () => {
    const today = new Date(Date.now());
    // utc day start time
    const min_attend_datetime = new Date(today);
    min_attend_datetime.setHours(0, 0, 0, 0);

    // utc day end time
    const max_attend_datetime = new Date(today);
    max_attend_datetime.setHours(23, 59, 59, 999);

    if (today.getTimezoneOffset !== 0) return { today, min_attend_datetime, max_attend_datetime };

    const minTime = min_attend_datetime.getTime();
    const maxTime = min_attend_datetime.getTime();
    const offsetMinutes = 360;

    // make utc zero (bd time wise)
    const customUtcZeroFormatMinDateTime = new Date(minTime - offsetMinutes * 60 * 1000);
    const customUtcZeroFormatMaxDateTime = new Date(maxTime - offsetMinutes * 60 * 1000);

    return { today, min_attend_datetime: customUtcZeroFormatMinDateTime, max_attend_datetime: customUtcZeroFormatMaxDateTime };
};
