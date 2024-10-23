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
    const currDateTime = new Date(Date.now());
    // utc day start time
    const min_attend_datetime = new Date(currDateTime);
    min_attend_datetime.setHours(0, 0, 0, 0);

    // utc day end time
    const max_attend_datetime = new Date(currDateTime);
    max_attend_datetime.setHours(23, 59, 59, 999);

    if (currDateTime.getTimezoneOffset !== 0) return { curr_time: currDateTime, min_attend_datetime, max_attend_datetime };

    const currTime = min_attend_datetime.getTime();
    const minTime = min_attend_datetime.getTime();
    const maxTime = min_attend_datetime.getTime();
    const offsetMinutes = 360;

    // make utc zero (bd time wise)
    const customUtcZeroFormatCurrDateTime = new Date(currTime - offsetMinutes * 60 * 1000);
    const customUtcZeroFormatMinDateTime = new Date(minTime - offsetMinutes * 60 * 1000);
    const customUtcZeroFormatMaxDateTime = new Date(maxTime - offsetMinutes * 60 * 1000);

    return { curr_time: customUtcZeroFormatCurrDateTime, min_attend_datetime: customUtcZeroFormatMinDateTime, max_attend_datetime: customUtcZeroFormatMaxDateTime };
};

export const createUTCAttendanceTimes = (time, min_attend_datetime, max_attend_datetime) => {
    const minAttndHour = time.getUTCHours();
    const minAttndMin = time.getUTCMinutes();
    const minAttndSec = time.getUTCSeconds();
    const minAttndMiliSec = time.getUTCMilliseconds();
    const lateTimeUTCHour = time.getUTCHours();

    // if (section.std_late_time.getUTCHours() < 18) {
    const customTime = lateTimeUTCHour < 18 ?
        new Date(max_attend_datetime.setUTCHours(minAttndHour, minAttndMin, minAttndSec, minAttndMiliSec))
        :
        new Date(min_attend_datetime.setUTCHours(minAttndHour, minAttndMin, minAttndSec, minAttndMiliSec));
    console.log({ customTime })
    return customTime;
}

export const handleDateTimeUtcZeroFormat = (time) => {
    const datetime = new Date(time);

    // if (datetime.getTimezoneOffset !== 0) return time;

    const dateTime = datetime.getTime();
    console.log({ datetime, dateTime })
    const offsetMinutes = 360;

    // make utc zero (bd time wise)
    const customUtcZeroFormtDateTime = new Date(dateTime - offsetMinutes * 60 * 1000);

    return customUtcZeroFormtDateTime;
};
