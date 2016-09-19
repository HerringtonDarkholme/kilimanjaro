// utility
export type F0<R> = (this: void) => R
export type F01<T, R> = (this: void, t?: T) => R
export type F1<A, R> = (this: void, a: A) => R


// vue related types
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


// vuex's API
export interface ActionStore<S, G, C, D> {
  readonly state: S
  readonly getters: G
  readonly commit: C
  readonly dispatch: D
}

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
export interface Commit0<K, T> {
  (k: K): (this: void, t?: T, opt?: CommitOption) => void
}
export interface Commit1<K, T> {
  (k: K): (this: void, t: T, opt?: CommitOption) => void
}

export interface RawAction0<S, G, C, D, T, R> {
  (s: ActionStore<S, G, C, D>): F0<Promise<R> | R> & F1<T, Promise<R>|R>
}
export interface RawAction1<S, G, C, D, T, R> {
  (s: ActionStore<S, G, C, D>): F1<T, Promise<R> | R>
}
export interface Dispatch0<K, T, R> {
  (k: K): F01<T, Promise<R[]>>
}
export interface Dispatch1<K, T, R> {
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

export interface Plugin<Str extends BaseStore> {
  (s: Str): void
}


// type bound and implementation type
export type BaseGetter = Getter<string, {}>
export type BaseCommit = Commit0<string, {}>
export type BaseAction = Dispatch0<string, {}|undefined, {}|void>
export type BasePayload = Payload0<string, {}>
export type BaseOpt = Opt<{}, BaseGetter, BaseCommit, BaseAction, BasePayload>
export type BaseStore = Store<{}, BaseGetter, BaseCommit, BaseAction, BasePayload>
export type BasePlugin = Plugin<BaseStore>


// type level wizardry
export interface Opt<S, G extends BaseGetter, M extends BaseCommit, A extends BaseAction, P extends BasePayload> {
  getter<K extends string, T>(key: K, f: RawGetter<S, G, T>): Opt<S, Getter<K, T> & G, M, A, P>

  mutation<K extends string, T>(key: K, f: RawMutation0<S, T>): Opt<S, G, Commit0<K, T> & M, A, Payload0<K, T> | P>
  mutation<K extends string, T>(key: K, f: RawMutation1<S, T>): Opt<S, G, Commit1<K, T> & M, A, Payload1<K, T> | P>

  action<K extends string, T, R>(key: K, f: RawAction0<S, G, M, A, T, R>): Opt<S, G, M, Dispatch0<K, T, R> & A,  P>
  action<K extends string, T, R>(key: K, f: RawAction1<S, G, M, A, T, R>): Opt<S, G, M, Dispatch1<K, T, R> & A,  P>

  module<K extends string, S1, G1 extends BaseGetter, M1 extends BaseCommit, A1 extends BaseAction, P1 extends BasePayload>(key: K, o: Opt<S1, G1, M1, A1, P1>): Opt<S & ModuleState<K, S1>, G1 & G, M1 & M, A1 & A, P1 | P>

  plugin(...plugins: Plugin<Store<S, G, M, A, P>>[]): this
  done(): Store<S, G, M, A, P>
}

export interface Store<S, G extends BaseGetter, M extends BaseCommit, A extends BaseAction, P extends BasePayload> {
  readonly state: S
  readonly getters: G
  readonly commit: M
  readonly dispatch: A

  subscribe(fn: Subscriber<P, S>): Unsubscription
  watch<R>(getter: VueGetter<S, R>, cb: WatchHandler<never, R>, options: WatchOption<never, R>): Function
  replaceState(state: S): void
}
