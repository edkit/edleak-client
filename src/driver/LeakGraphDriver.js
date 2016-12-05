import {Observable} from 'rxjs';
import {EdleakGraph} from 'source/eleakgraph.js'


function makeLeakGraphDriver(container) {
  let graph = new EdleakGraph(container);

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
  }
}

export { makeLeakGraphDriver };
