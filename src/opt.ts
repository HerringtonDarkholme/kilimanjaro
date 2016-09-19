import {StoreImpl} from './store'
import {CommitOption, ActionStore, Plugin, Opt} from './interface'

export type F0<R> = (this: void) => R
export type F01<T, R> = (this: void, t?: T) => R
export type F1<A, R> = (this: void, a: A) => R

export interface RawAction<S, G, M, A> {
  (this: void, s: ActionStore<S, G, M, A>): F01<any, any|Promise<any>>
}

export interface RawActions<S, G, M, A> {
  [k: string]: RawAction<S, G, M, A>
}

export interface RawMutation<S> {
  (this: void, s: S): (t?: any, m?: CommitOption) => void
}

export interface RawMutations<S> {
  [k: string]: RawMutation<S>
}

export interface RawGetter<S, G> {
  (this: void, s: S, getter: G): any
}

export interface RawGetters<S, G> {
  [k: string]: RawGetter<S, G>
}

export interface Modules {
  [k: string]: OptImpl<{}, {}, {}, {}, {}>
}


export class OptImpl<S, G, M, A, P> {

  /** @internal */ _state: S
  /** @internal */ _getters: RawGetters<S, G> = {}
  /** @internal */ _actions: RawActions<S, G, M, A> = {}
  /** @internal */ _mutations: RawMutations<S> = {}
  /** @internal */ _modules: Modules = {}
  /** @internal */ _plugins: Plugin<S, G, M, A, P>[]

  constructor(s: S) {
    this._state = s
  }

  getter<K extends string, T>(key: K, f: (s: S, g: G) => T): OptImpl<S, ((k: K) => T) & G, M, A, P> {
    this._getters[key as string] = f
    return this as any
  }

  mutation<K extends string, T>(key: K, f: (s: S) => F0<void> & F01<T, void>): OptImpl<S, G, ((k: K) => (t?: T, opt?: CommitOption) => void) & M, A, {type: K, payload?: T} | P>
  mutation<K extends string, T>(key: K, f: (s: S) => F1<T, void>): OptImpl<S, G, ((k: K) => (t: T, opt?: CommitOption) => void) & M, A, {type: K, payload: T} | P>
  mutation<K extends string, T>(key: K, f: (s: S) => F01<T, void>): OptImpl<S, G, ((k: K) => (t?: T, opt?: CommitOption) => void) & M, A, {type: K, payload: T} | P>
  {
    this._mutations[key as string] = f
    return this as any
  }

  action<K extends string, T, R>(key: K, f: (s: ActionStore<S, G, M, A>) => F0<R|Promise<R>> & F1<T,R|Promise<R>>): OptImpl<S, G, M, ((k: K) => F01<T, Promise<R[]>>) & A,  P>
  action<K extends string, T, R>(key: K, f: (s: ActionStore<S, G, M, A>) => F1<T,R|Promise<R>>): OptImpl<S, G, M, ((k: K) => F1<T, Promise<R[]>>) & A,  P>
  action<K extends string, T, R>(key: K, f: (s: ActionStore<S, G, M, A>) => F01<T,R|Promise<R>>): OptImpl<S, G, M, ((k: K) => F01<T, Promise<R[]>>) & A,  P>
  {
    this._actions[key as string] = f
    return this as any
  }

  module<K extends string, S1, G1, M1, A1, P1>(key: K, o: OptImpl<S1, G1, M1, A1, P1>): OptImpl<S & {readonly $: (k: K) => S1}, G1 & G, M1 & M, A1 & A, P1 | P> {
    this._modules[key as string] = o
    return this as any
  }

  plugin(...plugins: Plugin<S, G, M, A, P>[]): this {
    this._plugins = this._plugins.concat(plugins)
    return this
  }

  done(): StoreImpl<S, G, M, A, P> {
    return new StoreImpl(this)
  }
}

export function create(): Opt<never, never, never, never, never>
export function create<S>(s: S): Opt<S, never, never, never, never>
export function create<S>(s?: S): Opt<S, never, never, never, never> {
  if (!s) s = {} as any
  return new OptImpl(s) as any
}
