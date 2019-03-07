# 常用的util方法

``` js
export default {
  //map转对象
  strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      obj[k] = v;
    }
    return obj;
  },
  //对象转map
  objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
      strMap.set(k, obj[k]);
    }
    return strMap;
  },
  //json字符串转map
  jsonToStrMap(jsonStr) {
    return objToStrMap(JSON.parse(jsonStr));
  },
  isNullOrUndefined(s){
    if (s === null || s === undefined) {
      return true;
    }
    return false;
  },
  isEmpty(s){
    if (s === null || s === undefined || s.length === 0) {
      return true
    }
    return false;
  },
  getDate(date, format){
    if (date instanceof Date) {
      return date.format(format)
    } else {
      return new Date(date).format(format);
    }
  },
  isAlphaNumber(src){
    let regular = new RegExp(/^[a-z0-9]+$/i);
    return regular.test(src);
  },
  clear() {
    if (window.localStorage) {
      window.localStorage.clear();
    } else {
      console.error("window.localStorage is not support!!");
    }
  },
  setItem(key, value) {
    if (window.localStorage) {
      window.localStorage.setItem(key, JSON.stringify(value));
    } else {
      console.error("window.localStorage is not support!!");
    }
  },
  getItem(key) {
    if (window.localStorage) {
      return window.localStorage.getItem(key);
    } else {
      console.error("window.localStorage is not support!!");
    }
  },
  removeItem(key) {
    if (window.localStorage) {
      return window.localStorage.removeItem(key);
    } else {
      console.error("window.localStorage is not support!!");
    }
  }
}
```