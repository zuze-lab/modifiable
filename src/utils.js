export const identity = f => f;

export const identityFn = f => () => f;

const fromArgs = args => Array.prototype.slice.call(args);

// like react's setState
export const patch = (next, what) =>
  typeof next === 'function' ? next(what) : Object.assign({}, what, next);

// identical signature to createSelector from reselect
const defaultMemoize = (a, b) => a === b;

export function select() {
  const args = fromArgs(arguments);
  const fn = args.pop();
  const mem = fn.memoize || defaultMemoize;
  const deps = Array.isArray(args[0]) ? args[0] : args;
  const real = deps.length ? deps : [identity];
  const last = [];
  const selector = modified => {
    real.reduce((acc, d, idx) => {
      const val = checkAt(d, modified);
      if (mem(val, last[idx])) return acc;
      last[idx] = val;
      return true;
    }, false) && fn.apply(null, last.concat(deps.length ? modified : []));
    // cool
    return selector;
  };
  return selector;
}

// used by modifiable to determine if a modifier function should run based on dependencies
export const shouldRun = (deps, next, last) =>
  !deps.length || diffAt(deps, next, last);

const checkAt = (pathFn, arg) =>
  typeof pathFn === 'string' ? arg[pathFn] : pathFn(arg);

// determine if objects are shallow equal at the paths/functions given
export const diffAt = (paths, next, last) =>
  next !== last &&
  (!last || paths.some(path => checkAt(path, next) !== checkAt(path, last)));

export const createModifiers = modifiers =>
  modifiers.map(m => createModifier(m));

export function createModifier() {
  const args = fromArgs(arguments);
  const f = Array.isArray(args[0]) ? args[0] : args;
  const mod = f.shift();
  const deps = Array.isArray(f[0]) ? f[0] : f;
  let last;
  const arr = [
    context => {
      const r = !last || !deps.length || shouldRun(deps, context, last);
      if (r) arr[1] = mod(context);
      last = context;
      return r;
    },
  ];
  return arr;
}
