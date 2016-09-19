export interface Subscriber<P, S> {
  (mutation: P, state: S): void
}

export interface VueGetter<S, R> {
  (s: S): R
}

export interface CommitOption {
  silent?: boolean
}

export type WatchHandler<C, T> = (this: C, newVal?: any, oldVal?: any) => void

export interface WatchOption<C, T>{
  deep?: boolean
  immediate?: boolean
  handler?: WatchHandler<C, T>
}

export type Unsubscription = () => void

export interface ActionStore<S, G, M, A> {
  readonly dispatch: A
  readonly commit: M
  readonly getters: G
  readonly state: S
}

export type F0<R> = (this: void) => R
export type F01<T, R> = (this: void, t?: T) => R
export type F1<A, R> = (this: void, a: A) => R
export type Plugin<S, G, M, A, P> = (s: StoreImpl<S, G, M, A, P>) => void

import {StoreImpl} from './store'


export interface RawGetter<S, G extends Getter<string, {}>, T> {
  (s: S, g: G): T
}

export interface Getter<K, T> {
  (k: K): T
}

export interface RawMutation0<S, T> {
  (s: S): F0<void> & F01<T, void>
}
export interface RawMutation1<S, T> {
  (s: S): F1<T, void>
}
export interface Mutation0<K, T> {
  (k: K): (this: void, t?: T, opt?: CommitOption) => void
}
export interface Mutation1<K, T> {
  (k: K): (this: void, t: T, opt?: CommitOption) => void
}

export interface RawAction0<S, G, M, A, T, R> {
  (s: ActionStore<S, G, M, A>): F0<Promise<R> | R> & F1<T, Promise<R>|R>
}
export interface RawAction1<S, G, M, A, T, R> {
  (s: ActionStore<S, G, M, A>): F1<T, Promise<R> | R>
}
export interface Action0<K, T, R> {
  (k: K): F01<T, Promise<R[]>>
}
export interface Action1<K, T, R> {
  (k: K): F1<T, Promise<R[]>>
}

export interface Payload0<K, T> {
  type: K
  payload?: T
}
export interface Payload1<K, T> {
  type: K
  payload: T
}

export interface ModuleState<K, S> {
  readonly $: (k: K) => S
}

export type BaseGetter = Getter<string, {}>
export type BaseMutation = Mutation0<string, {}>
export type BaseAction = Action0<string, {}|undefined, {}|void>
export type BasePayload = Payload0<string, {}>
export type BaseStore = StoreImpl<{}, BaseGetter, BaseMutation, BaseAction, BasePayload>

export interface Opt<S, G extends BaseGetter, M extends BaseMutation, A extends BaseAction, P extends BasePayload> {
  getter<K extends string, T>(key: K, f: RawGetter<S, G, T>): Opt<S, Getter<K, T> & G, M, A, P>

  mutation<K extends string, T>(key: K, f: RawMutation0<S, T>): Opt<S, G, Mutation0<K, T> & M, A, Payload0<K, T> | P>
  mutation<K extends string, T>(key: K, f: RawMutation1<S, T>): Opt<S, G, Mutation1<K, T> & M, A, Payload1<K, T> | P>

  action<K extends string, T, R>(key: K, f: RawAction0<S, G, M, A, T, R>): Opt<S, G, M, Action0<K, T, R> & A,  P>
  action<K extends string, T, R>(key: K, f: RawAction1<S, G, M, A, T, R>): Opt<S, G, M, Action1<K, T, R> & A,  P>

  module<K extends string, S1, G1 extends BaseGetter, M1 extends BaseMutation, A1 extends BaseAction, P1 extends BasePayload>(key: K, o: Opt<S1, G1, M1, A1, P1>): Opt<S & ModuleState<K, S1>, G1 & G, M1 & M, A1 & A, P1 | P>

  plugin(...plugins: Plugin<S, G, M, A, P>[]): this
  done(): StoreImpl<S, G, M, A, P>
}
