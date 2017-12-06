import { handleActions } from 'redux-actions';
import update from 'immutability-helper';
import Action from './actions';


const initialState = {
  currentStep: -1,
  loaded: false,
  loading: false,
  open: false,
  steps: [],
  variables: {},
  volume: null,
};

const getNextStateWithStepIdsAndResult = (state, stepIds, success = true) => {
  const step = state.steps[state.currentStep];
  const valid = step && stepIds && stepIds.some(stepId => (step.id === stepId));
  if (!valid) return { ...state };
  return {
    ...state,
    currentStep: state.currentStep + (success ? 1 : -1),
  };
};

export default handleActions({
  [Action.beginLoading]: (state, { payload }) => ({
    ...state,
    loaded: false,
    loading: true,
  }),
  [Action.endLoading]: (state, { payload }) => {
    const { startFromStep, tutorial } = payload;
    let index = 0;
    if (startFromStep) {
      // find current steps from startFrom (id)
      index = tutorial.steps.findIndex(step => step.id === startFromStep);
    }
    return ({
      ...state,
      loaded: true,
      loading: false,
      open: true,
      currentStep: index,
      ...tutorial,
    });
  },
  [Action.achieve]: ((state, { payload }) =>
    getNextStateWithStepIdsAndResult(state, payload)
  ),
  [Action.revert]: ((state, { payload }) =>
    getNextStateWithStepIdsAndResult(state, payload, false)
  ),
  [Action.next]: state => ({
    ...state,
    currentStep: Math.min(state.currentStep + 1, state.steps.length - 1),
  }),
  [Action.back]: state => ({
    ...state,
    currentStep: Math.max(state.currentStep - 1, 0),
  }),
  [Action.skip]: state => ({
    ...state,
    currentStep: state.steps.length - 1,
  }),
  [Action.close]: state => ({
    ...state,
    open: false,
    variables: {},
  }),
  [Action.setVariable]: (state, { payload }) => update(state, {
    variables: { $merge: payload },
  }),
  [Action.jumpTo]: (state, { payload }) => ({
    ...state,
    currentStep: state.steps.findIndex(step => step.id === payload),
  }),
}, initialState);
