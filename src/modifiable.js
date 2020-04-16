import { patch, identity, createModifiers, createModifier } from './utils';

export default (state, options = {}) => {
  const newModifiers = createModifiers(options.modifiers || []);
  const subscribers = new Set();

  // state variables
  let modified = state;
  let context = options.context || {};

  const update = () => {
    modified = newModifiers.reduce((acc, m) => m[1](acc), state);

    // notify subscribers
    subscribers.forEach(s => s(modified));
  };

  const setContext = next => ((context = patch(next, context)), run());

  const getState = () => modified;

  const run = () =>
    newModifiers.reduce(
      (acc, m) => (m[0](context, setContext, getState) ? ++acc : acc),
      0
    ) && update();

  // run on init
  run();

  const remove = modifier => {
    const i = newModifiers.indexOf(modifier);
    if (i !== -1) newModifiers.splice(i, 1), update();
  };

  // api
  return {
    setContext,
    getState,
    remove,
    subscribe(subscriber) {
      subscriber(modified);
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    modify() {
      const m = createModifier.apply(null, arguments);
      newModifiers.push(m), run();
      return () => remove(m);
    },
    clear: (ctx = identity) => {
      newModifiers.splice(0);
      setContext(ctx) || update();
    },
  };
};
