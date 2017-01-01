import {Observable} from 'rxjs';

import { EdleakDataset } from 'src/edleakDataset.js';

function makeDatasetDriver() {
  let dataObserver = null;
  let dataset = null;

  function createDatasetEvent() {
    console.log("createDatasetEvent");
    return Observable.create(observer => {
        dataObserver = observer;
      })
      .share();
  }

  return function datasetDriver(data$) {
    console.log("datasetDriver");
    data$
    .subscribe(data => {
      dataset = EdleakDataset.loadFromObject(data);
      if(dataObserver != null) {
        dataObserver.next(dataset);
      }
    });

    return {
      dataset : createDatasetEvent
    }
  }
}

export { makeDatasetDriver };
