import { BehaviorSubject } from "rxjs";
import { getLocalStorage } from "./common-util";

const theme_storage_mode = getLocalStorage("mode");
const theme_mode = theme_storage_mode ? theme_storage_mode : "lightgreen";
const themeSubject = new BehaviorSubject(theme_mode);

export const themeSubjectService = {
  sendThemeSubject: (message) => themeSubject.next(message),
  clearThemeSubject: () => themeSubject.next(),
  getThemeSubject: () => themeSubject.asObservable(),
};
