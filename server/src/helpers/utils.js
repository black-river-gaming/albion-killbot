function digitsFormatter(num) {
  if (!num) return 0;
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || 0;
}

function humanFormatter(num, digits) {
  const si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "m" },
    { value: 1e9, symbol: "b" },
    { value: 1e12, symbol: "t" },
    { value: 1e15, symbol: "q" },
    { value: 1e18, symbol: "Q" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

function fileSizeFormatter(size) {
  const i = Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(2) * 1 + " " + ["B", "KB", "MB", "GB", "TB"][i];
}

function parseFileSize(sizeStr) {
  const m = sizeStr.match(/(\d+)(B|KB?|MB?|GB?|TB?)/i);
  if (!m) return sizeStr;
  const unit = `${m[2]}${!m[2].endsWith("B") ? "B" : ""}`;
  return m[1] * Math.pow(1024, ["B", "KB", "MB", "GB", "TB"].indexOf(unit));
}

function getBool(v, def) {
  return v === undefined ? def : /^(on|true|1)$/i.test(v);
}

function getNumber(v, def) {
  const n = Number(v);
  return isNaN(n) ? def : n;
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

const printSpace = (count) => " ".repeat(Math.max(count, 0));

const average = (...numbers) => {
  return Math.round(numbers.reduce((sum, n) => sum + n, 0) / numbers.length);
};

const equalsCaseInsensitive = (a, b) => a && a.localeCompare(b, undefined, { sensitivity: "base" }) === 0;

const isObject = (obj) => {
  return obj && typeof obj === "object" && !Array.isArray(obj);
};

const mergeObjects = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeObjects(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeObjects(target, ...sources);
};

const toHiphenLowerCase = (text) => {
  return text.toLowerCase().replace(/ /g, "-");
};

module.exports = {
  average,
  clone,
  digitsFormatter,
  equalsCaseInsensitive,
  fileSizeFormatter,
  getBool,
  getNumber,
  humanFormatter,
  mergeObjects,
  parseFileSize,
  printSpace,
  toHiphenLowerCase,
};
