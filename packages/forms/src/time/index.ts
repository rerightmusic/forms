export const secondsToHoursMinutesSeconds = (secs: number) => {
  const hours = Math.trunc(secs / 3600);
  const minutes = Math.trunc((secs - hours * 3600) / 60);
  const seconds = secs - hours * 3600 - minutes * 60;
  const d = new Date();
  d.setHours(hours);
  d.setMinutes(minutes);
  d.setSeconds(seconds);
  return d.toLocaleTimeString();
};

export const secondsToDate = (secs: number) => {
  const hours = Math.trunc(secs / 3600);
  const minutes = Math.trunc((secs - hours * 3600) / 60);
  const seconds = secs - hours * 3600 - minutes * 60;
  const value = new Date();
  value.setHours(hours);
  value.setMinutes(minutes);
  value.setSeconds(seconds);
  return value;
};

export const dateToSeconds = (date: Date) => {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
};
