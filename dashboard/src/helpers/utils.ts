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

export const getFrequency = (frequency: string) =>
  ({
    off: "Do not display",
    "1hour": "Display every 1 hour",
    "6hour": "Display every 6 hours",
    "12hour": "Display every 12 hours",
    "1day": "Display every day",
    "7day": "Display every week",
    "15day": "Display every 15 days",
    "1month": "Display every month",
  }[frequency] || frequency);
