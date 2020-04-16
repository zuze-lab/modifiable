# modifiable

[![npm version](https://img.shields.io/npm/v/@zuze/modifiable.svg)](https://npmjs.org/package/@zuze/modifiable)
[![Coverage Status](https://coveralls.io/repos/github/zuze-lab/modifiable/badge.svg)](https://coveralls.io/github/zuze-lab/modifiable)
[![Build Status](https://travis-ci.com/zuze-lab/modifiable.svg)](https://travis-ci.com/zuze-lab/modifiable)
[![Bundle Phobia](https://badgen.net/bundlephobia/minzip/@zuze/modifiable)](https://bundlephobia.com/result?p=@zuze/modifiable)

## What?

State Management - a lot like [redux](https://github.com/reduxjs/redux) except completely different.

## No, really, what?

**@zuze/modifiable** originally came about when figuring out an efficient way to deal with conditional things happening in forms - when user inputs X into field Y, then field Z should behave a certain way.

In the above scenario **@zuze/modifiable** refers to the user input as *context* and *state* as anything that may be modified in response to a change in context.

The concept of *context* and *state* interacting this way led to the creation of this super tiny (but tremendously powerful) package. 

## Why?

Think of it as a tool for performing transient/reversible state modifications. 

A little like the super cool [immer](https://www.npmjs.com/package/immer), but much more narrowly focused.


## How?
- Create a modifiable with a state (any value) and optionally modifiers and initial context.
- State is changed by setting *context* - a plain JS object - on the modifiable, however it can also be changed by adding/removing modifiers (using [modify](#modify))

- A [modifier](#modifierfunction) is a higher order function that accepts a single argument - *context* - and returns a function ([modification function](#modificationfunction)) that accepts the last modified state and returns the next modified state.

- A modifier SHOULD specify it's "dependencies" - keys of the context, or functions that accept context and return a value. Specifying dependencies serve to [memoize](https://en.wikipedia.org/wiki/Memoization) the [modifier](#modifierfunction) so it's only run when necessary.

- Whenever context changes, a modifiable will run all modifiers that have

  - no dependencies or

  - dependencies that have changed since the last run

- All modification functions returned from modifiers will then be applied sequentially to the state

- Just like redux, modifier and modification functions, must be pure
  
## API
Create a new modifiable by 
```js
modifiable<T,R>(state: T, options?: { modifiers: Array<Modifier<T,R>>, context: R} )
```

### - <a name="subscribe"></a>`subscribe(Subscriber: (state: T) => void): () => void`
Subscribes to changes in the state and returns an unsubscribe function. (identical to function of the same name on a redux store). 

For better control, this function also accepts a signature idential to [reselect](https://github.com/reduxjs/reselect):

### - <a name="subscribe-select"></a>`subscribe(...selectors: Array<(state: T) => any>, resultFunc(...selectorResults: any[], state: T) => void): () => void`

### - <a name="getstate"></a> `getState(): T`
Returns the modified state (identical to function of same name on a redux store)

### - <a name="setcontext"></a> `setContext(Partial<R> | (existing: R) => R)`
Just like React's `setState`.  Causes necessary ModifiedFunctions to run. Setting context is the primary way to change a modifiable's state. (Think of it as redux `dispatch`). 

Note: When using a patch function, if you return a new reference (regardless of shallow equality), the applicable modifiers
will be run again and subscribers will be notified if anything has changed. If you return the same reference, nothing will happen.

### - <a name="modify"></a> `modify(ModifierFunction, ...deps?: Array<string | (context: R) => any)>: () => void`
Adds a modifier at run time. Modifiers added a runtime will be run immediately. Returns a function to remove the `ModifierFunction`. Adding/removing modifiers are the second way to change a modifiable's state.

### - <a name="clear"></a> `clear(context?: R)`
Removes all modifiers and (optionally) sets the context. If no context is supplied, context won't be changed.

### Additional

### - <a name="identity"></a>`identity<T>(arg: T) => T`
### - <a name="patch"></a>`patch<T>(next: Partial<T> | ((current: T) => T, current: T) => T`

## Small
Core implementation of `modifiable`, minified and gzipped, is about 700 *bytes*.