export const getLocalStorageItem = localStorage.getItem("token");

export const capitalize = (text = "") =>
  text.replace(/^\w/, (c) => c.toLocaleUpperCase());

export const getLocaleName = (lang: string) =>
  capitalize(new Intl.DisplayNames(lang, { type: "language" }).of(lang));
