import {Observable} from 'rxjs';


function makeWsRunnerDriver() {
  let wsLoader = null;
  let wsObserver = null;

  function createRunnerStream() {
    console.log("createRunnerStream");
    return Observable.create(observer => {
        wsObserver = observer;
      });
  }

  return function wsRunnerDriver(action$) {
    console.log("wsRunnerDriver");
    wsLoader = new WsLoader();
    wsLoader.setCbk(function() {
      console.log("WsRunner done");
      if(wsObserver != null)
        wsObserver.next(wsLoader.getData())
      },
      function() {}
    );

    action$
    .subscribe(action => {
      switch(action.type) {
        case 'start':
          console.log("wsRunnerDriver start");
          if(wsLoader != null) {
            wsLoader.start(
              action.address,
              action.port,
              action.duration,
              action.period);
          }
        break;

        case 'stop':
          console.log("wsRunnerDriver stop");
          if(wsLoader != null)
            wsLoader.stop();
        break;
      }
    });

    return {
      runner : createRunnerStream
    }
  }
}

export { makeWsRunnerDriver };
