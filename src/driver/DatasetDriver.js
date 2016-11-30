import {Observable} from 'rxjs';


function makeDatasetDriver() {
  let dataObserver = null;
  let dataset = null;

  function createDatasetEvent() {
    console.log("createDatasetEvent");
    return Observable.create(observer => {
        dataObserver = observer;
      })
      .share();
      //.publish(); // this is a hot observable
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
