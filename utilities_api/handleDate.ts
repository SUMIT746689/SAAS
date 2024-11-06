export function isDateValid(dateStr: any) {
    // @ts-ignore
    return !isNaN(new Date(dateStr));
}