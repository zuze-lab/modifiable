import { patch, identity, identityFn, diffAt } from '../src/utils';

describe('identity', () => {
  it('should be identity', () => {
    const fixture = { a: 'b' };
    expect(identity(fixture)).toBe(fixture);
  });
});

describe('diffAt', () => {
  it('should return false if no keys are given', () => {
    expect(diffAt([], {}, {})).toBe(false);
  });

  it('should return false if values are the same', () => {
    const a = [1, 2, 3];
    expect(diffAt(['a'], { a }, { a })).toBe(false);
  });

  it('should return true if values are different', () => {
    const a = [1, 2, 3];
    const b = [1, 2, 3];
    expect(diffAt(['a'], { a }, { a: b })).toBe(true);
  });
});

describe('patch', () => {
  it('should call the function', () => {
    const fn = jest.fn();
    const what = { a: 'b' };
    patch(fn, what);
    expect(fn).toHaveBeenCalledWith(what);
  });

  it('should return a new object', () => {
    const what = { a: 'b' };
    const next = { c: 'd', a: 'm' };
    expect(patch(next, what)).not.toBe(what);
    expect(patch(next, what)).not.toBe(next);
    expect(patch(next, what)).toEqual({ ...what, ...next });
  });
});

describe('identityFn', () => {
  it('should return a function that returns its argument', () => {
    const a = { a: 'b' };
    expect(identityFn(a)()).toBe(a);
  });
});
