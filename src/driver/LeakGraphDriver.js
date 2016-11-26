import {Observable} from 'rxjs';
import {EdleakGraph} from 'source/eleakgraph.js'


function makeLeakGraphDriver(container) {
  let graph = new EdleakGraph(container);

  return function leakGraphDriver(data$) {
    data$.subscribe( data => {
      graph.setData(data.getDataset());
      graph.redraw();
      console.log(data);
    })
  }
}

export { makeLeakGraphDriver };
