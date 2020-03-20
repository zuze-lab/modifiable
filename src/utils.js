export const identity = f => f;

export const identityFn = f => () => f;

// like react's setState
export const patch = (next, what) =>
  typeof next === 'function' ? next(what) : { ...what, ...next };

// used by modifiable to determine if a modifier function should run based on dependencies
export const shouldRun = (deps, next, last) =>
  !deps.length || diffAt(deps, next, last);

const checkAt = (pathFn, arg) =>
  typeof pathFn === 'string' ? arg[pathFn] : pathFn(arg);

// determine if objects are shallow equal at the paths/functions given
export const diffAt = (paths, next, last) =>
  next !== last &&
  (!last || paths.some(path => checkAt(path, next) !== checkAt(path, last)));

export const effect = fn => (...args) => (fn(...args), identity);
