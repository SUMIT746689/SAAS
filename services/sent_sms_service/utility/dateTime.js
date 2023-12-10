export const todayMinMaxDateTime = () => {
    const today = new Date(Date.now());
    // utc day start time 
    const std_min_attend_date_wise = new Date(today);
    std_min_attend_date_wise.setHours(0, 0, 0, 0);

    // utc day end time
    const std_max_attend_date_wise = new Date(today);
    std_max_attend_date_wise.setHours(23, 59, 59, 999);

    return { std_min_attend_date_wise, std_max_attend_date_wise };
};