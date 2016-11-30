import {Observable} from 'rxjs';


function makeFileReaderDriver() {
  let dataObserver = null;

  function createDataEvent() {
    return Observable.create(observer => {dataObserver = observer;});
  }

  function loadFile(file$) {
    file$
      .filter(command => command.action == 'load')
      .map(command => command.file)
      .filter(file => file.type.match('application/json'))
      .flatMap(file => {
        let fileData$ = Observable.create( observer =>
        {
          let reader = new FileReader()
          reader.onload = event => {
            observer.next(event.target.result);
            observer.complete();
          };
          reader.readAsText(file);
        });
        return fileData$;

      })
      .subscribe( data => {
        if(dataObserver != null) {
          dataObserver.next(JSON.parse(data));
        }
      });
  }

  function saveFile(file$) {
    file$
      .filter(command => command.action == 'save')
      .subscribe( command => {
        const json = JSON.stringify(command.data);
        const blob = new Blob([json], {type: "application/json"});
        const url  = URL.createObjectURL(blob);
        command.node.setAttribute("href", url);
        command.node.click();
      });

  }

  return function fileReaderDriver(file$) {
    let all$ = file$.publish();

      loadFile(all$);
      saveFile(all$);
      all$.connect();

      return {
        data : createDataEvent
      }
  }
}

export { makeFileReaderDriver };
