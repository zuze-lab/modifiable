export const identity = f => f;

export const identityFn = f => () => f;

export const fromArgs = args => Array.prototype.slice.call(args);

// like react's setState
export const patch = (next, what) =>
  typeof next === 'function' ? next(what) : Object.assign({}, what, next);

// just like createSelector from reselect
export function select() {
  const args = fromArgs(arguments);
  const fn = args.pop();
  const last = [];
  return modified =>
    !args.length
      ? fn(modified)
      : args.reduce((acc, d, idx) => {
          const val = checkAt(d, modified);
          return val === last[idx] ? acc : ((last[idx] = val), true);
        }, false) && fn.apply(null, last);
}

// dependencies - the subscriber function is called if any of the dependencies change
export function subscribe() {
  const args = fromArgs(arguments);
  const fn = args.shift();
  let last;
  return modified => {
    if (!args.length || shouldRun(args, modified, last)) fn(modified);
    last = modified;
  };
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

export const deps = deps => ({ deps: Array.isArray(deps[0]) ? deps[0] : deps });

export const addModifiers = (mods, map = new Map()) =>
  mods.reduce((acc, m) => addModifier(m, acc), map);

export const addModifier = (mod, map) => {
  const arr = Array.isArray(mod) ? mod : [mod];
  return map.set(arr.shift(), deps(arr));
};
