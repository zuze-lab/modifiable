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
// interesting idea, not necessary now, let's save the bytes
// export function subscribe() {
//   const args = fromArgs(arguments);
//   const fn = args.shift();
//   let last;
//   return modified => {
//     if (!args.length || shouldRun(args, modified, last)) fn(modified);
//     last = modified;
//   };
// }

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

  // args = [modifier]
  // args = [ [modifier, dep1,dep2] ]
  // args = [ [modifier, [dep1,dep2] ] ]

  const f = Array.isArray(args[0]) ? args[0] : [args[0]];
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
