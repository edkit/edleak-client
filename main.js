import {Observable} from 'rxjs';
import {run} from '@cycle/rxjs-run';
import {makeDOMDriver, div, span, i, input, a} from '@cycle/dom';

import {makeFileReaderDriver} from './src/driver/FileReaderDriver.js';
import {makeDatasetDriver} from './src/driver/DatasetDriver.js';
import {makeLeakGraphDriver} from './src/driver/LeakGraphDriver.js';

//ReactDOM.render(<App />, document.getElementById('app'));

function intent(domSource, fileSource, datasetSource) {
    return {
        loadClick$: domSource.select('.upload.icon').events('click')
            .map(ev => ev.target.parentNode.querySelector(".file-selector")),

        loadFile$: domSource .select('.file-selector')
            .events('change')
            .map(ev => ev.target.files[0]),

        saveFile$: domSource.select('.download.icon')
          .events('click')
          .map(ev => ev.target.parentNode.querySelector(".file-save")),

        fileData$: fileSource.data(),
        dataset$: datasetSource.dataset(),
    };
}

function model(actions) {
    /*
    let foo$ = actions.leakGraph$.map(data => {
      console.log(data);
    })
    .subscribe();
    */

    let loadFile$ = actions.loadFile$
      .map(file => {
        return {
          action: 'load',
          file: file
        };
      });


    // save file with latest dataset when save is clicked
    let saveFile$ = actions.saveFile$
      .withLatestFrom(actions.dataset$, (save, dataset) => {
      //.map(e => {
        return {
          action: 'save',
          node: save,
          data: dataset.getDataset() };
      });

    return {
        loadClick$: actions.loadClick$,
        file$: Observable.merge(loadFile$, saveFile$),
        dataset$: actions.fileData$,
        leakGraph$: actions.dataset$
    }

}

function view(state$) {
    const fileStyle = {
      width: "0px",
      height: "0px",
      overflow: "hidden"
    };

    const fileSaveStyle = {
      width: "0px",
      height: "0px",
      //display:inline-block;
      // background-image: url(download.png);
    }


    return Observable.of(
          div('.edleak.main' ,[
          span('.loadButton', [
              input('.file-selector', {style: fileStyle, attrs: {type: 'file'}}),
              i('.large.upload.icon')
          ]),
          span('.saveButton', [
            a('.file-save', {style: fileSaveStyle, attrs: {download: 'edleak.json'}}),
            i('.large.download.icon')
          ]),
         div('#leakerGraph', {style: {display:'block'}})
       ])
     );
}

function main(sources) {
    const actions = intent(sources.DOM, sources.FILE, sources.DATASET);
    const state = model(actions);

    const click$ = state.loadClick$;
    const file$ = state.file$;
    const dataset$ = state.dataset$;
    const vdom$ = view(state);

   return {
     DOM: vdom$,
     CLICK: click$,
     FILE: file$,
     DATASET: dataset$,
     LEAKGRAPH: state.leakGraph$
   };
}

function clickDriver(node$) {
    node$.subscribe( node => {
        node.click();
    });
}


run(main, {
  DOM:        makeDOMDriver('#app'),
  CLICK:      clickDriver,
  FILE:       makeFileReaderDriver(),
  DATASET:    makeDatasetDriver(),
  LEAKGRAPH:  makeLeakGraphDriver('leakerGraph')
});
