import {Observable} from 'rxjs';
import {div, input, label} from '@cycle/dom';

function intent(domSource, allocerSource) {
  return {
    stackChange$: domSource.select('.input.callstack-state').events('change')
      .map(ev => ev.target.checked)
      .startWith(false),

    allocer$: allocerSource
      //.startWith(null)
  }
}

function model(actions) {
  const stackAction$ = actions.stackChange$
    .withLatestFrom(actions.allocer$, (stackState, allocer) => {
      return {
        id: allocer.id,
        stackState: stackState
      };
    });

  return {
    action$: stackAction$,
    allocer$: actions.allocer$
  };
}

function view(allocer$) {
  const style = {
    width: "5em"
  };

  /*
  return stack$
    .map(stack => {
  */
  /*
  return Observable.combineLatest(
  stack$, allocer$,
  (stackState, allocer) => {
  */

  return allocer$
    .map(allocer => {
      if(allocer == null)
        return div('.panel');

      if(allocer.stackState == true)
        $('.input.callstack-state').attr("checked","checked");
        //$('.input.callstack-state').checkbox('check');
      else
        $('.input.callstack-state').removeAttr("checked");
        //$('.input.callstack-state').checkbox('uncheck');

      return div('.panel' ,[
        div('.ui.toggle.checkbox', [
          input('.input.callstack-state', {
            attrs: {
              type: 'checkbox'
            }
          }),
            label('.callstack-state', 'Retrieve call stack')
        ])
      ])
    })
    .startWith(div('.panel'));
}


function AllocerPanel(sources) {
  const actions = intent(sources.DOM, sources.allocer);
  const modelData = model(actions);
  const vdom$ = view(modelData.allocer$);

  return {
    DOM: vdom$,
    action: modelData.action$
  };
}

export { AllocerPanel };
