import moment from 'moment';

const TIME_FORMAT = 'YYYY-MM-DD HH:mm';

export const getDisplayTime = (timeString) =>
moment(timeString).add(8, 'hours').format(TIME_FORMAT);
