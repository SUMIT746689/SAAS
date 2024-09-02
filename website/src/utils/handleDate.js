// const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const handleGetMonth = (date) => {
    const d = new Date(date);
    return month[d.getMonth()];
}

export const handleGetDate = (date) => {
    const d = new Date(date);
    return d.getUTCDate();
}