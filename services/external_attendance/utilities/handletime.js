export const handleDateTimeUtcZeroFormat = (time) => {
    const datetime = new Date(time);
    
    // if (datetime.getTimezoneOffset !== 0) return time;
    
    const dateTime = datetime.getTime();
    console.log({datetime,dateTime})
    const offsetMinutes = 360;

    // make utc zero (bd time wise)
    const customUtcZeroFormtDateTime = new Date(dateTime - offsetMinutes * 60 * 1000);

    return customUtcZeroFormtDateTime;
};
