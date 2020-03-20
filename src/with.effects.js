import { effect } from './utils';

export default (api, ...effects) =>
  effects.reduce((acc, e) => {
    const [fn, ...deps] = Array.isArray(e) ? e : [e];
    api.modify(effect(fn), ...deps);
    return acc;
  }, api);
