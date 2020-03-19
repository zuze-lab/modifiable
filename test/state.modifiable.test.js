import { stateModifiable } from '../src/state.modifiable';

describe('state modifiable', () => {
  it('should work', () => {
    const state = {};
    const m = stateModifiable(state);
    expect(m.getState()).toBe(state);
  });

  it('should reset', () => {
    const state = {};
    const m = stateModifiable(state);
    m.setState('jim');
    m.reset();
    expect(m.getState()).toBe(state);
    m.reset('new state');
    expect(m.getState()).toBe('new state');
  });
});
