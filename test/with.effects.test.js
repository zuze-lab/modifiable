import { modifiable, withEffects } from '../src';
import { runAllTimers } from '../test.utils';
jest.useFakeTimers();

describe('with effects', () => {
  it('should run an effect', async () => {
    const modified = 'fred';
    const modifiers = [
      [jest.fn(ctx => state => (ctx.someKey ? modified : state)), 'someKey'],
    ];
    // this effect will only run when `someVal` changes
    const myEffect = [
      async (ctx, setContext) => {
        try {
          await new Promise((res, rej) => (ctx.someVal ? res() : rej()));
          setContext({ someKey: true });
        } catch (err) {
          setContext({ someKey: false });
        }
      },
      'someVal',
    ];
    const state = 'jim';
    const m = withEffects(
      modifiable(state, { modifiers, effects: [myEffect] }),
      myEffect
    );
    expect(m.getState()).not.toBe(modified);
    // set someVal context
    m.setContext({ someVal: 10 });
    // still doesn't affect state (async)
    expect(m.getState()).not.toBe(modified);
    // skip the async
    await runAllTimers();
    // state affected
    expect(m.getState()).toBe(modified);
    // update someVal - effect will run
    m.setContext({ someVal: undefined });
    // async so it still hasn't affected state
    expect(m.getState()).toBe(modified);
    // skip the async
    await runAllTimers();
    // state affected
    expect(m.getState()).not.toBe(modified);
  });

  it('should run an effect (2)', async () => {
    const modified = 'fred';
    const modifiers = [
      [jest.fn(ctx => state => (ctx.someKey ? modified : state)), 'someKey'],
    ];
    // this effect will only run when `someVal` changes
    const myEffect = async (ctx, setContext) => {
      try {
        await new Promise((res, rej) => (ctx.someVal ? res() : rej()));
        ctx.someKey || setContext({ someKey: true });
      } catch (err) {
        ctx.someKey && setContext({ someKey: false });
      }
    };
    const state = 'jim';
    const m = withEffects(modifiable(state, { modifiers }), myEffect);
    expect(m.getState()).not.toBe(modified);
    // set someVal context
    m.setContext({ someVal: 10 });
    // still doesn't affect state (async)
    expect(m.getState()).not.toBe(modified);
    // skip the async
    await runAllTimers();
    // state affected
    expect(m.getState()).toBe(modified);
    // update someVal - effect will run
    m.setContext({ someVal: undefined });
    // async so it still hasn't affected state
    expect(m.getState()).toBe(modified);
    // skip the async
    await runAllTimers();
    // state affected
    expect(m.getState()).not.toBe(modified);
  });
});
