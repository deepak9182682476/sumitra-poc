import moment from "moment";

const UTC_OFFSET = 330;

export const toLocalDateTime = (datetime) => {
  return moment(datetime).utcOffset(UTC_OFFSET).format("DD-MM-YYYY hh:mm A");
};

export const toLocalDate = (date) => {
  return moment(date).utcOffset(UTC_OFFSET).format("DD-MM-YYYY");
};

export const setLocalStorage = (key, value) => {
  sessionStorage.setItem(key, value);
};

export const getLocalStorage = (key) => {
  return sessionStorage.getItem(key);
};

export const removeLocalStorageItem = (key) => {
  sessionStorage.removeItem(key);
};

export const setSessionStorage = (key, value) => {
  sessionStorage.setItem(key, value);
};

export const getSessionStorage = (key) => {
  return sessionStorage.getItem(key);
};

export const removeSessionStorageItem = (key) => {
  sessionStorage.removeItem(key);
};

export const getRandomColor = () => {
  var letters = "0123456789ABCDEF";
  var color = "#";

  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
};
