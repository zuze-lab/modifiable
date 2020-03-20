import { patch, shouldRun, identity } from './utils';

const makeMap = (what = []) =>
  what.reduce(
    (acc, w) =>
      acc.set(...(Array.isArray(w) ? [w[0], { deps: w[1] }] : [w, {}])),
    new Map()
  );

export const modifiable = (state, options = {}) => {
  const modifiers = makeMap(options.modifiers);
  const effects = makeMap(options.effects);
  const subscribers = new Set();

  // state variables
  let modified = state;
  let context = options.context || {};
  let lastContext;

  const runEffects = ctx => {
    [...effects.entries()].forEach(
      ([fn, deps]) =>
        shouldRun(deps, ctx, lastContext) && setContext(fn(context) || identity)
    );
    return identity;
  };

  modifiers.set(runEffects, {});

  const update = () => {
    // apply all modifier fns sequentially against original state
    modified = [...modifiers.values()].reduce((acc, { fn }) => fn(acc), state);

    // notify subscribers
    [...subscribers].forEach(s => s(modified));
    return true;
  };

  const run = () => {
    const toRun = [...modifiers.entries()]
      // determine which modifiers need to be run based on their dependencies
      .filter(m => shouldRun(m[1].deps, context, lastContext))
      // run them and set the functions on the modifier map
      .map(([fn, a]) => (a.fn = fn(context)));

    lastContext = context;
    return toRun.length && update();
  };

  // run on init
  run();

  const setContext = next => {
    context = patch(next, context);
    return run();
  };

  const getState = () => modified;

  // api
  return {
    setContext,
    getState,
    effect: (fn, deps) => {
      effects.set(fn, deps);
      return () => effects.delete(fn);
    },
    subscribe: subscriber => {
      subscriber(modified);
      subscribers.add(subscriber);
      return () => subscribers.delete(subscriber);
    },
    modify: (modifier, deps) => {
      modifiers.set(modifier, { deps, fn: modifier(context) });
      update();
      return () => {
        modifiers.delete(modifier), update();
      };
    },
    clear: (ctx = identity) => {
      modifiers.clear();
      setContext(ctx) || update();
    },
  };
};