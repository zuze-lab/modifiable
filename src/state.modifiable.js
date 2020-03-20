// Simple state modifiable - where the context is the state (but it can still be modified)
import modifiable from './modifiable';
import { identityFn } from './utils';

export const stateModifiable = (state, ...modifiers) => {
  const { getState, setContext: setState, modify, subscribe } = modifiable(
    state,
    {
      context: state,
      modifiers: [[identityFn], ...modifiers],
    }
  );

  return {
    getState,
    setState,
    modify,
    subscribe,
    reset: values => setState(() => values || state),
  };
};
