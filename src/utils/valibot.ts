export const isDate1LessOrEqualThanDate2 = (date1: string, date2: string) => {
  const date1Timestamp = new Date(date1).getTime();
  const date2Timestamp = new Date(date2).getTime();
  return date1Timestamp <= date2Timestamp;
};
