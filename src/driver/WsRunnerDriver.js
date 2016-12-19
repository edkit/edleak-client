import {Observable} from 'rxjs';


function makeWsRunnerDriver() {
  let wsLoader = null;
  let wsCallerAdder = null;
  let wsObserver = null;
  let stateObserver = null;

  function createDataStream() {
    console.log("createRunnerStream");
    return Observable.create(observer => {
        wsObserver = observer;
      });
  }

  function createStateStream() {
    console.log("createStateStream");
    return Observable.create(observer => {
        stateObserver = observer;
      });
  }

  return function wsRunnerDriver(action$) {
    console.log("wsRunnerDriver");
    wsLoader = new WsLoader();
    wsCallerAdder = new WsCallerAdder();

    wsLoader.setCbk(function() {
      console.log("WsRunner done");
      if(wsObserver != null)
        wsObserver.next(wsLoader.getData());
      if(stateObserver != null)
        stateObserver.next({'run':false, 'step':0, 'stepCount':0})
      },
      function() {
        if(stateObserver != null)
          stateObserver.next({'run':true, 'step':0, 'stepCount':0})
      },
      function(step, stepCount) {
        if(stateObserver != null)
          stateObserver.next({'run':true, 'step':step, 'stepCount':stepCount})
      }
    );

    action$
    .subscribe(action => {
      switch(action.type) {
        case 'start':
          if(wsLoader != null) {
            if(wsLoader.isStarted() == false) {
              console.log("wsRunnerDriver start");
              wsLoader.start(
                action.address,
                action.port,
                action.duration,
                action.period);
            }
          }
        break;

        case 'stop':
            if(wsLoader != null) {
              if(wsLoader.isStarted() == true) {
                console.log("wsRunnerDriver stop");
                wsLoader.stop();
              }
            }
        break;

        case 'addStackWatch':
          if(wsCallerAdder != null) {
            wsCallerAdder.add(
              action.allocerId,
              action.address,
              action.port);
          }
        break;
      }
    });

    return {
      data : createDataStream,
      state : createStateStream
    }
  }
}

export { makeWsRunnerDriver };
