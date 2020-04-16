import {
  patch,
  shouldRun,
  identity,
  deps,
  addModifiers,
  subscribe,
  fromArgs,
} from './utils';

export default (state, options = {}) => {
  const modifiers = addModifiers(options.modifiers || []);

  const subscribers = new Set();

  // state variables
  let modified = state;
  let context = options.context || {};
  let lastContext;

  const update = () => {
    // apply all modifier fns sequentially against original state
    const values = [];
    modifiers.forEach(v => values.push(v));
    modified = values.reduce((acc, { fn }) => fn(acc), state);

    // notify subscribers
    subscribers.forEach(s => s(modified));
    return true;
  };

  const setContext = next => ((context = patch(next, context)), run());

  const getState = () => modified;

  const run = () => {
    const toRun = [];
    modifiers.forEach(
      (v, fn) => shouldRun(v.deps, context, lastContext) && toRun.push([fn, v])
    );
    toRun.forEach(a => (a[1].fn = a[0](context, setContext, getState)));
    lastContext = context;
    return toRun.length && update();
  };

  // run on init
  run();

  const remove = modifier => (modifiers.delete(modifier), update());

  function modify() {
    const args = fromArgs(arguments);
    const modifier = args.shift();
    modifiers.set(
      modifier,
      Object.assign(deps(args), {
        fn: modifier(context, setContext, getState),
      })
    );
    update();
    return () => remove(modifier);
  }

  // api
  return {
    setContext,
    getState,
    remove,
    subscribe() {
      const memoed = subscribe.apply(null, arguments);
      memoed(modified);
      subscribers.add(memoed);
      return () => subscribers.delete(memoed);
    },
    modify,
    clear: (ctx = identity) => {
      modifiers.clear();
      setContext(ctx) || update();
    },
  };
};
