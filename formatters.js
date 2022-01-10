export function nFormatter(num, digits) {
  var si = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var i;
  for (i = si.length - 1; i > 0; i--) {
    if (num >= si[i].value) {
      break;
    }
  }
  return (num / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
}

let numeral = require("numeral");
export function formatPercentage(value) {
  return numeral(value).format("0.00%");
}

export function formatSmallPercentage(value) {
  return numeral(value).format("0.000%");
}

export function formatRelativePercentage(value) {
  if (value == "") {
    return value;
  }

  if (!value) {
    return ""
  }
  return numeral(value).divide(100).format("0.0%");
}

export function formatCurrency(value) {
  if (value == "" || value == null) {
    return value;
  }
  return numeral(value).format("$0,0.00");
}

export function formatCurrencyLarge(value) {
  if (value == "" || value == null) {
    return value;
  }
  return numeral(value).format("($0,0.00 a)");
}

export function formatNumber(value) {
  if (value == "") {
    return value;
  }
  return numeral(value).format("0.00");
}

export function formatNumberLarge(value) {
  if (value == "") {
    return value;
  }
  return numeral(value).format("(0.0a)");
}

export function formatGreekNumber(value) {
  if (value == "") {
    return value;
  }
  return numeral(value).format("0.000");
}

export function formatVerySmallNumber(value) {
  if (value == "") {
    return value;
  }
  return numeral(value).format("0.000000");
}
export function formatInt(value) {
  if (value == "") {
    return value;
  }
  return numeral(value).format("0");
}
