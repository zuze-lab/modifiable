import {
  patch,
  identity,
  createModifiers,
  createModifier,
  select,
} from './utils';

export default (state, options = {}) => {
  const modifiers = createModifiers(options.modifiers || []);
  const subscribers = new Set();

  // state variables
  let modified = state;
  let context = options.context || {};

  const update = () => {
    modified = modifiers.reduce((acc, m) => m[1](acc), state);

    // notify subscribers
    subscribers.forEach(s => s(modified));
  };

  const setContext = next => {
    const nextContext = patch(next, context);
    if (nextContext !== context) (context = nextContext), run();
  };

  const getState = () => modified;

  const run = () =>
    modifiers.reduce(
      (acc, m) => (m[0](context, setContext, getState) ? ++acc : acc),
      0
    ) && update();

  // run on init
  run();

  const remove = modifier => {
    const i = modifiers.indexOf(modifier);
    if (i !== -1) modifiers.splice(i, 1), update();
  };

  // api
  return {
    setContext,
    getState,
    subscribe() {
      const subscriber = select.apply(null, arguments)(modified);
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    modify() {
      const m = createModifier.apply(null, arguments);
      modifiers.push(m), run();
      return () => remove(m);
    },
    clear: (ctx = identity) => {
      modifiers.splice(0);
      setContext(ctx) || update();
    },
  };
};
