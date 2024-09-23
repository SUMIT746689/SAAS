const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const getToday = () => {
  const today = new Date(Date.now());
  const day = today.getDay();
  return days[day];
};

// for(let i=0; i<12;i++){
export const lastDateOfMonth = ({ monthInt, date = new Date() }) => new Date(date.getFullYear(), monthInt + 1, 0);
// const month = lastDateOfMonth().toLocaleString('default', { month: 'long' });
// console.log(month);
// console.log(lastDateOfMonth().getMonth(), lastDateOfMonth().getDate())
// }

export function convertUTCDateToIsoLocalDate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset()*60*1000).toISOString();   
}

export type monthListType =
  | 'january'
  | 'february'
  | 'march'
  | 'april'
  | 'may'
  | 'june'
  | 'july'
  | 'august'
  | 'september'
  | 'october'
  | 'november'
  | 'december';

export const monthList: monthListType[] = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december'
];
