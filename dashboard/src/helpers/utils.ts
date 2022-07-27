export const getLocalStorageItem = localStorage.getItem("token");

export const capitalize = (text = "") =>
  text.replace(/^\w/, (c) => c.toLocaleUpperCase());

export const getLocaleName = (lang: string) =>
  capitalize(new Intl.DisplayNames(lang, { type: "language" }).of(lang));

export const getCurrency = (
  money: number,
  { locale = "en-US", currency = "USD" }
) => money.toLocaleString(locale, { style: "currency", currency });

export const getCurrencySymbol = ({ locale = "en-US", currency = "USD" }) =>
  (0)
    .toLocaleString(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    .replace(/\d/g, "")
    .trim();
