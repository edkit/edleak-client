import {Observable} from 'rxjs';
import {div, input, i, span} from '@cycle/dom';

function intent(domSource) {
  return {
    recordClick$: domSource.select('.recorder > .circle.icon').events('click')
      .map(ev => ev.target),

    duration$: domSource.select('.input.duration').events('change')
      .map(ev => parseInt(ev.target.value))
      .startWith(30),

    period$: domSource.select('.input.period').events('change')
      .map(ev => parseInt(ev.target.value))
      .startWith(1)

  }
}

function model(actions, state$) {
    const internalState$ = Observable.combineLatest(
      actions.duration$,
      actions.period$,
      state$,
      (duration, period, state) => {
        return {
          recordState: state.record,
          duration: duration,
          period: period,
          progress: state.progress
        };
      });

    const recordAction$ = actions.recordClick$
      .withLatestFrom(internalState$, (click, state) => {
        return {
          type: state.recordState ? 'stop' : 'start',
          duration: state.duration,
          period: state.period
        };
      });

    return {
      state$: internalState$,
      recordAction$: recordAction$
    };

}

function view(state$) {
  const style = {
    width: "5em"
  };

  return state$
    .map(state => {
      $('.ui.bottom.attached.progress').progress({percent: state.progress });
      return div('.recorder.header.item' ,[

        div('.ui.input', [
          input(state.recordState ? '.ui.input.duration.disabled' : '.ui.input.duration', {
            style: style,
            attrs: {
              type: 'text',
              value: state.duration,
              disabled: state.recordState
            }
          })
        ]),

        div('.ui.input', [
          input(state.recordState ? '.ui.input.period.disabled' : '.ui.input.period', {
            style: style,
            attrs: {
              type: 'text',
              value: state.period,
              disabled: state.recordState
            }
          })
        ]),

        i(state.recordState ? '.large.circle.icon.red' : '.large.circle.icon'),
        div('.ui.bottom.attached.progress', [
          div('.bar')
        ])
      ])
    });

}

function PeriodRunner(sources) {
  const sourceState$ = sources.state.startWith({
      'progress':'0',
      'record': false
    });

  const actions = intent(sources.DOM);
  const modelData = model(actions, sourceState$);
  const vdom$ = view(modelData.state$);

  return {
    DOM: vdom$,
    action: modelData.recordAction$
  };
}

export { PeriodRunner };
