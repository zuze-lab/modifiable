import { patch, shouldRun, identity, deps, addModifiers } from './utils';

export default (state, options = {}) => {
  const modifiers = addModifiers(options.modifiers || []);

  const subscribers = new Set();

  // state variables
  let modified = state;
  let context = options.context || {};
  let lastContext;

  const update = () => {
    // apply all modifier fns sequentially against original state
    modified = [...modifiers.values()].reduce((acc, { fn }) => fn(acc), state);

    // notify subscribers
    [...subscribers].forEach(s => s(modified));
    return true;
  };

  const setContext = next => {
    context = patch(next, context);
    return run();
  };

  const getState = () => modified;

  const run = () => {
    const toRun = [...modifiers.entries()]
      // determine which modifiers need to be run based on their dependencies
      .filter(m => shouldRun(m[1].deps, context, lastContext))
      // run them and set the functions on the modifier map
      .map(([fn, a]) => (a.fn = fn(context, setContext, getState)));

    lastContext = context;
    return toRun.length && update();
  };

  // run on init
  run();

  const modify = (modifier, ...dependencies) => {
    modifiers.set(modifier, {
      ...deps(dependencies),
      fn: modifier(context, setContext, getState),
    });
    update();
    return () => {
      modifiers.delete(modifier), update();
    };
  };

  // api
  return {
    setContext,
    getState,
    subscribe: subscriber => {
      subscriber(modified);
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    modify,
    clear: (ctx = identity) => {
      modifiers.clear();
      setContext(ctx) || update();
    },
  };
};
