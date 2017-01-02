import {Observable} from 'rxjs';

function makeUrlArgDriver() {
  let argObserver = null;
  let argList = [];

  function getUrlArg(key) {
    let result = null;
    let tmp = [];
    location.search
      .substr(1)
        .split("&")
        .forEach(function (item) {
        tmp = item.split("=");
        if (tmp[0] === key) result = decodeURIComponent(tmp[1]);
    });
    return result;
  }

  function createUrlArgEvent(key) {
    console.log("createUrlArgEvent");
    let val = getUrlArg(key);
    if(val != null) {
      return Observable.from([{'key': key, 'val': val}]);
    }
    return Observable.from([]);
  }

  return function urlArgDriver() {
    console.log("urlArgDriver");

    return {
      arg : createUrlArgEvent
    }
  }
}

export { makeUrlArgDriver };
