import {Observable} from 'rxjs';
import {div, input, i, span} from '@cycle/dom';

function intent(domSource) {
  return {
    recordClick$: domSource.select('.recorder > .circle.icon').events('click')
      .map(ev => ev.target),

    duration$: domSource.select('.recorder > .input.duration').events('change')
      .map(ev => ev.target.value)
      .startWith(30),

    period$: domSource.select('.recorder > .input.period').events('change')
      .map(ev => ev.target.value)
      .startWith(1)

  }
}

function model(actions) {

  const recordState$ = actions.recordClick$
    .scan( (acc, current) => {
      return acc ? false : true;
    })
    .startWith(false);

    const state$ = Observable.combineLatest(
      recordState$,
      actions.duration$,
      actions.period$,
      (recordState, duration, period) => {
        console.log('duration: ' + duration);
        return {
          recordState: recordState,
          duration: duration,
          period: period,
          progress: "70"
        };
      });

  return state$;
  /*
  return {
    recordState$: recordState$
  }
  */
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


  /*
  return Observable.of(
    div('.recorder.header.item' ,[
      //span('.ui', {attrs: { 'data-tooltip':"foo", 'data-position':'bottom' }}, [
        input('.ui.input', {style: style, attrs: {type: 'text'}}),
      //]),
      input('.ui.input', {style: style, attrs: {type: 'text'}}),
      i('.large.circle.icon'),
      div('.ui.bottom.attached.progress', [
        div('.bar')
      ])
    ])
  );
  */
}

function PeriodRunner(sources) {
  const domSource = sources.DOM;
  const props$ = sources.props;

  const actions = intent(sources.DOM);
  const state$ = model(actions);
  const vdom$ = view(state$);

  return {
    DOM: vdom$,
    state: state$
  };
}

export { PeriodRunner };
