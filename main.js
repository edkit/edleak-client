import {Observable, Subject} from 'rxjs';
import {run} from '@cycle/rxjs-run';
import {makeDOMDriver, div, span, i, input, a, button} from '@cycle/dom';

import {makeFileReaderDriver} from './src/driver/FileReaderDriver.js';
import {makeDatasetDriver} from './src/driver/DatasetDriver.js';
import {makeLeakGraphDriver} from './src/driver/LeakGraphDriver.js';
import {makeWsRunnerDriver} from './src/driver/WsRunnerDriver.js';
import {PeriodRunner} from './src/component/PeriodRunner.js';

//ReactDOM.render(<App />, document.getElementById('app'));
function splitHostnameAndPort(name) {
  const parts = name.split(':');
  let addrInfo = {};
  addrInfo.ip = parts[0];
  if(parts.length > 1)
     addrInfo.port = parts[1];
  else
     addrInfo.port = 8080;

  return addrInfo;
}

function intent(domSource, fileSource, datasetSource, netRunnerSource, periodRunner) {
    return {
        loadClick$: domSource.select('.upload.icon').events('click')
            .map(ev => ev.target.parentNode.querySelector(".file-selector")),

        loadFile$: domSource .select('.file-selector')
            .events('change')
            .map(ev => ev.target.files[0]),

        saveFile$: domSource.select('.download.icon')
          .events('click')
          .map(ev => ev.target.parentNode.querySelector(".file-save")),

        targetDevice$: domSource.select('.target-device').events('change')
          .map(ev => ev.target.value)
          .startWith("localhost"),

        fileData$: fileSource.data(),
        netData$: netRunnerSource.data(),
        netState$: netRunnerSource.state(),

        dataset$: datasetSource.dataset(),

        periodRunnerAction$: periodRunner.action,

        graphScale$: domSource.select('.buttons.scale').events('click')
          .map(ev => ev.target.classList.contains('log') ? 'log' : 'linear')
          .startWith('linear')

    };
}

function model(actions, periodState$) {
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
        return {
          action: 'save',
          node: save,
          data: dataset.getDataset() };
      });

    const wsRunnerAction$ = actions.periodRunnerAction$
      .withLatestFrom(actions.targetDevice$, (action, target) => {
        const addrInfo = splitHostnameAndPort(target);
        return {
          type: action.type,
          duration: action.duration,
          period: action.period,
          address: addrInfo.ip,
          port: addrInfo.port
        };
      });

    const leakGraph$ = actions.dataset$
      .map(dataset => {
        return { type: 'data', dataset: dataset};
      });

    const graphScale$ = actions.graphScale$
      .map(scale => {
        return { type: 'scale', scale: scale};
      })

    actions.netState$.subscribe(state => {
      const periodRunnerState = {
        record: state.run,
        progress: state.stepCount == 0 ? 0 : state.step / state.stepCount
      }
      periodState$.next(periodRunnerState);
    })

    return {
        loadClick$: actions.loadClick$,
        file$: Observable.merge(loadFile$, saveFile$),
        dataset$: Observable.merge(actions.fileData$, actions.netData$),
        leakGraph$: Observable.merge(leakGraph$, graphScale$),
        wsRunnerAction$: wsRunnerAction$
    }

}

function view(state$, periodRunner) {
  const fileStyle = {
    width: "0px",
    height: "0px",
    overflow: "hidden"
  };

  const fileSaveStyle = {
    width: "0px",
    height: "0px"
  }

  return periodRunner.DOM.map(runnerVdom =>
  {
    return div('.edleak.main' ,[
      div('.header.ui', { style: {'display':'flex', 'align-items':'center'}}, [
        div('.header.item', { style: {'width': '80px'}}, [ // load/save menu
          //span('.loadButton', [
              input('.file-selector', {style: fileStyle, attrs: {type: 'file'}}),
              i('.large.upload.icon'),
          //]),
          //span('.saveButton', [
            a('.file-save', {style: fileSaveStyle, attrs: {download: 'edleak.json'}}),
            i('.large.download.icon')
          //])
        ]),

        div('.header.item', [ // target address menu
          div('.ui.left.icon.input', [
            input('.target-device', { attrs: { type:"text", placeholder:"Target address..."}}),
            i('.linkify.icon')
          ])
        ]),

        runnerVdom,

        div('.header.item', [ // graph scale
          div('.ui.buttons.scale', [
            button('.ui.button.linear', 'linear'),
            button('.ui.button.log', 'log')
          ])
        ])
      ]),
      div('.left-panel', [
        div('#leakerGraph')
      ])
    ]);
  });
}

function main(sources) {
  const periodStateProxy$ = new Subject();
  const periodRunner = PeriodRunner({DOM: sources.DOM, state: periodStateProxy$});
  const actions = intent(sources.DOM, sources.FILE, sources.DATASET, sources.WSRUNNER, periodRunner);
  const state = model(actions, periodStateProxy$);

  const click$ = state.loadClick$;
  const file$ = state.file$;
  const dataset$ = state.dataset$;

  const vdom$ = view(state, periodRunner);



  return {
   DOM: vdom$,
   CLICK: click$,
   FILE: file$,
   DATASET: dataset$,
   LEAKGRAPH: state.leakGraph$,
   WSRUNNER: state.wsRunnerAction$
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
  LEAKGRAPH:  makeLeakGraphDriver('leakerGraph'),
  WSRUNNER:   makeWsRunnerDriver()
});
