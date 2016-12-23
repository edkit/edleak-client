import {Observable} from 'rxjs';
import {div, input, label, i} from '@cycle/dom';

function intent(domSource, allocerSource) {
  return {
    stackChange$: domSource.select('.input.callstack-state').events('change')
      .map(ev => ev.target.checked),
      //.startWith(false),

    allocer$: allocerSource
      .startWith(null)
  }
}

function model(actions) {
  const stackAction$ = actions.stackChange$
    .withLatestFrom(actions.allocer$, (stackState, allocer) => {
      return {
        allocer: allocer,
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


  return allocer$
    .map(allocer => {
      if( allocer && allocer.stackState == true)
        $('.ui.checkbox.callstack-state').checkbox('check');
      else
        $('.ui.checkbox.callstack-state').checkbox('uncheck');

      return div('.panel.ui.styled.accordion' ,[
        div('.title.active', [
          i('.dropdown.icon'),
          'CallStack'
        ]),
        div('.content', [
          div('.ui.toggle.checkbox.callstack-state',
            { style: {'display':'flex'}}, [
            input('.input.callstack-state', {
              attrs: {
                type: 'checkbox'
              }
            }),
            label('.callstack-state', 'Retrieve call stack')
          ])
        ]),

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
