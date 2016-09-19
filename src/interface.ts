export interface Subscriber<P, S> {
  (mutation: P, state: S): void
}

export interface RawGetter<S, R> {
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
export type Plugin<S, G, M, A, P> = (s: Store<S, G, M, A, P>) => void

import {Store} from './store'

export interface Getter {
  (k: string): any
}

export interface Mutation {
  (k: string): (t?: any, opt?: CommitOption) => void
}

export interface Opt<S, G extends Getter, M extends Mutation, A, P> {
  getter<K extends string, T>(key: K, f: (s: S, g: G) => T): Opt<S, ((k: K) => T) & G, M, A, P>

  mutation<K extends string, T>(key: K, f: (s: S) => F0<void> & F01<T, void>): Opt<S, G, ((k: K) => (t?: T, opt?: CommitOption) => void) & M, A, {type: K, payload?: T} | P>
  mutation<K extends string, T>(key: K, f: (s: S) => F1<T, void>): Opt<S, G, ((k: K) => (t: T, opt?: CommitOption) => void) & M, A, {type: K, payload: T} | P>

  action<K extends string, T, R>(key: K, f: (s: ActionStore<S, G, M, A>) => F0<R|Promise<R>> & F1<T,R|Promise<R>>): Opt<S, G, M, ((k: K) => F01<T, Promise<R[]>>) & A,  P>
  action<K extends string, T, R>(key: K, f: (s: ActionStore<S, G, M, A>) => F1<T,R|Promise<R>>): Opt<S, G, M, ((k: K) => F1<T, Promise<R[]>>) & A,  P>

  module<K extends string, S1, G1 extends Getter, M1 extends Mutation, A1, P1>(key: K, o: Opt<S1, G1, M1, A1, P1>): Opt<S & {readonly $: (k: K) => S1}, G1 & G, M1 & M, A1 & A, P1 | P>

  plugin(...plugins: Plugin<S, G, M, A, P>[]): this
  done(): Store<S, G, M, A, P>
}
