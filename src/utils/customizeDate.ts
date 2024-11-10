export const customizeDate = (date: string) => {
  if (typeof date !== 'string') return '';
  const dateObj = new Date(date)
  const formateDate_ = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' })
  return formateDate_.format(dateObj)
}

export const customizeDateWithTime = (date: string) => {
  if (typeof date !== 'string') return '';
  const dateObj = new Date(date)
  const formateDate_ = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: "short" })
  return formateDate_.format(dateObj)
}

export const handleStartDate = (startDate) => new Date(new Date(startDate).setHours(0, 0, 0, 0)).toISOString();
export const handleEndDate = (endDate) => new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString();
