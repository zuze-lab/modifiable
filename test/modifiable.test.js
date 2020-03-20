import { createSelector } from 'reselect';
import { modifiable } from '../src/modifiable';
import { effect } from '../src/utils';

describe('modifiable', () => {
  it('should construct', () => {
    const state = 'jim';
    const m = modifiable(state);
    expect(m.getState()).toEqual(state);
  });

  it('should call subscribers immediately', () => {
    const subscriber = jest.fn();
    const state = 'jim';
    const m = modifiable(state);
    m.subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledWith(state);
  });

  it('should unmodify', () => {
    const modificationFn = jest.fn(() => 'fred');
    const state = 'jim';
    const m = modifiable(state);
    const undo = m.modify(() => modificationFn);
    expect(m.getState()).toBe('fred');
    undo();
    expect(m.getState()).toBe(state);
  });

  it('should clear modifiers', () => {
    const modificationFn = jest.fn(() => 'fred');
    const modifiers = [[() => modificationFn]];
    const state = 'jim';
    const m = modifiable(state, { modifiers });
    expect(m.getState()).toBe('fred');
    m.clear();
    expect(m.getState()).toBe(state);
  });

  it('should accept a modifier without dependencies', () => {
    const modified = 'fred';
    const modificationFn = jest.fn(() => modified);
    const modifierFn = jest.fn(() => modificationFn);
    const modifiers = [[modifierFn]];
    const state = 'jim';
    const m = modifiable(state, { modifiers });
    expect(m.getState()).toBe(modified);
  });

  it('should accept a modifier that has string dependencies (array)', () => {
    const state = { first: 'jim', second: 'fred' };

    const fn = jest.fn(() => state => state);
    const modifiers = [[fn, ['someContext', 'path']]];
    const m = modifiable(state, { modifiers });
    expect(fn).toHaveBeenCalled();
    fn.mockClear();
    m.setContext({ key: 'val' });
    expect(fn).not.toHaveBeenCalled();
    m.setContext({ someContext: 'val' });
    expect(fn).toHaveBeenCalled();
    fn.mockClear();
    m.setContext({ path: 'fred' });
    expect(fn).toHaveBeenCalled();
    fn.mockClear();
    m.setContext({ path: 'fred' });
    expect(fn).not.toHaveBeenCalled();
  });

  it('should accept a modifier that has string dependencies', () => {
    const state = { first: 'jim', second: 'fred' };

    const fn = jest.fn(() => state => state);
    const modifiers = [[fn, 'someContext', 'path']];
    const m = modifiable(state, { modifiers });
    expect(fn).toHaveBeenCalled();
    fn.mockClear();
    m.setContext({ key: 'val' });
    expect(fn).not.toHaveBeenCalled();
    m.setContext({ someContext: 'val' });
    expect(fn).toHaveBeenCalled();
    fn.mockClear();
    m.setContext({ path: 'fred' });
    expect(fn).toHaveBeenCalled();
    fn.mockClear();
    m.setContext({ path: 'fred' });
    expect(fn).not.toHaveBeenCalled();
  });

  it('should accept a modifier that has function dependencies', () => {
    const state = { first: 'jim', second: 'fred' };

    const fn = jest.fn(() => state => state);
    const modifiers = [[fn, ({ key1 }) => key1 && key1[0]]];
    const m = modifiable(state, { modifiers });
    expect(fn).toHaveBeenCalled();
    fn.mockClear();
    m.setContext({ key1: ['a'] });
    expect(fn).toHaveBeenCalled();
    fn.mockClear();
    m.setContext({ key1: ['a', 'b'] });
    expect(fn).not.toHaveBeenCalled();
    m.setContext({ key1: ['c', 'b'] });
    expect(fn).toHaveBeenCalled();
  });

  it('should work with selectors', () => {
    const mock = jest.fn();
    const selector = createSelector(state => state.first[0], mock);
    const state = { first: ['a', 'b'] };
    const fn = jest.fn(state => state);
    const modifiers = [[() => fn]];
    const m = modifiable(state, { modifiers });
    m.subscribe(selector);
    expect(mock).toHaveBeenCalledWith('a');
    mock.mockClear();
    fn.mockReturnValue({ first: ['a', 'b', 'c'] });
    m.setContext(1);
    expect(mock).not.toHaveBeenCalled();
    fn.mockReturnValue({ first: ['c', 'b', 'c'] });
    expect(mock).not.toHaveBeenCalled();
    m.setContext(1);
    expect(mock).toHaveBeenCalledWith('c');
  });
});
