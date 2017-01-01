import {Observable} from 'rxjs';
import {EdleakGraph} from 'src/EdLeakGraph.js'


function makeLeakGraphDriver(container) {
  let allocerObserver = null;
  let graph = new EdleakGraph(container);
  graph.setSelectCallback(function(id) {
    if(allocerObserver != null)
      allocerObserver.next(id);
  })

  function createSelectedAllocerStream() {
    console.log("createSelectedAllocerStream");
    return Observable.create(observer => {
        allocerObserver = observer;
      });
      //.share();
  }

  return function leakGraphDriver(source$) {
    source$.subscribe(data => {
      switch(data.type) {
        case 'data':
          graph.setData(data.dataset.getDataset());
          graph.redraw();
        break;

        case 'scale':
          graph.setScaleType(data.scale);
        break;
      }
    });

    return {
      selectedAllocer: createSelectedAllocerStream
    };
  }
}

export { makeLeakGraphDriver };
