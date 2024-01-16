//多语言日期
export const formatMonth = (month: number, language: string) => {
  let obj: { en: string; zh: string; tc: string } | {} = {};
  switch (month) {
    case 1:
      obj = {
        en: "January",
        zh: "一月",
        tc: "壹月",
      };
      break;
    case 2:
      obj = {
        en: "February",
        zh: "二月",
        tc: "贰月",
      };
      break;
    case 3:
      obj = {
        en: "March",
        zh: "三月",
        tc: "叁月",
      };
      break;
    case 4:
      obj = {
        en: "April",
        zh: "四月",
        tc: "肆月",
      };
      break;
    case 5:
      obj = {
        en: "May",
        zh: "五月",
        tc: "伍月",
      };
      break;
    case 6:
      obj = {
        en: "June",
        zh: "六月",
        tc: "陆月",
      };
      break;
    case 7:
      obj = {
        en: "July",
        zh: "七月",
        tc: "柒月",
      };
      break;
    case 8:
      obj = {
        en: "August",
        zh: "八月",
        tc: "捌月",
      };
      break;
    case 9:
      obj = {
        en: "September",
        zh: "九月",
        tc: "玖月",
      };
      break;
    case 10:
      obj = {
        en: "October",
        zh: "十月",
        tc: "拾月",
      };
      break;
    case 11:
      obj = {
        en: "November",
        zh: "十一月",
        tc: "拾壹月",
      };
      break;
    case 12:
      obj = {
        en: "December",
        zh: "十二月",
        tc: "拾壹月",
      };
      break;
  }
  return obj[language];
};
export const formatWeek = (week: number, language: string) => {
  let obj: { en: string; zh: string; tc: string } | {} = {};
  switch (week) {
    case 1:
      obj = {
        en: "Monday",
        zh: "星期一",
        tc: "星期壹",
      };
      break;
    case 2:
      obj = {
        en: "Tuesday",
        zh: "星期二",
        tc: "星期贰",
      };
      break;
    case 3:
      obj = {
        en: "Wednesday",
        zh: "星期三",
        tc: "星期叁",
      };
      break;
    case 4:
      obj = {
        en: "Thursday",
        zh: "星期四",
        tc: "星期肆",
      };
      break;
    case 5:
      obj = {
        en: "Friday",
        zh: "星期五",
        tc: "星期伍",
      };
      break;
    case 6:
      obj = {
        en: "Saturday",
        zh: "星期六",
        tc: "星期陆",
      };
      break;
    case 0:
      obj = {
        en: "Sunday",
        zh: "星期日",
        tc: "星期日",
      };
      break;
  }
  return obj[language];
};
export const formatDay = (day: number, language: string) => {
  let str = "";
  if (language === "en") {
    switch (day) {
      case 1:
      case 21:
      case 31:
        str = "st";
        break;
      case 2:
      case 22:
        str = "nd";
        break;
      case 3:
      case 23:
        str = "rd";
        break;
      default:
        str = "th";
    }
  } else {
    str = "日";
  }
  return day + str;
};
