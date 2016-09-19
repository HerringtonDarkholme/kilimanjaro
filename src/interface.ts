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

export interface GetDef<S, G extends Getters<string, {}>, T> {
  (s: S, g: G): T
}
export interface Getters<K, T> {
  (k: K): T
}

export interface MutateDef0<S, T> {
  (s: S): F0<void> & F01<T, void>
}
export interface MutateDef1<S, T> {
  (s: S): F1<T, void>
}
export interface MutationHandler0<T> {
  (this: void, t?: T, opt?: CommitOption): void
}
export interface MutationHandler1<T> {
  (this: void, t: T, opt?: CommitOption): void
}
export interface Commit0<K, T> {
  (k: K): MutationHandler0<T>
}
export interface Commit1<K, T> {
  (k: K): MutationHandler1<T>
}

export interface ActDef0<S, G, C, D, T, R> {
  (s: ActionStore<S, G, C, D>): F0<Promise<R> | R> & F1<T, Promise<R>|R>
}
export interface ActDef1<S, G, C, D, T, R> {
  (s: ActionStore<S, G, C, D>): F1<T, Promise<R> | R>
}
export type ActionHandler0<T, R> = F01<T, Promise<R[]>>
export type ActionHandler1<T, R> = F1<T, Promise<R[]>>
export interface Dispatch0<K, T, R> {
  (k: K): ActionHandler0<T, R>
}
export interface Dispatch1<K, T, R> {
  (k: K): ActionHandler1<T, R>
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
export type BaseGetters = Getters<string, {}>
export type BaseCommit = Commit0<string, {}>
export type BaseDispatch = Dispatch0<string, {}|undefined, {}|void>
export type BasePayload = Payload0<string, {}>
export type BaseOpt = Opt<{}, BaseGetters, BaseCommit, BaseDispatch, BasePayload>
export type BaseStore = Store<{}, BaseGetters, BaseCommit, BaseDispatch, BasePayload>
export type BasePlugin = Plugin<BaseStore>
export type BaseSubscriber = Subscriber<BasePayload, {}>


// type level wizardry
export interface Opt<S, G extends BaseGetters, C extends BaseCommit, D extends BaseDispatch, P extends BasePayload> {
  getter<K extends string, T>(key: K, f: GetDef<S, G, T>): Opt<S, Getters<K, T> & G, C, D, P>

  mutation<K extends string, T>(key: K, f: MutateDef0<S, T>): Opt<S, G, Commit0<K, T> & C, D, Payload0<K, T> | P>
  mutation<K extends string, T>(key: K, f: MutateDef1<S, T>): Opt<S, G, Commit1<K, T> & C, D, Payload1<K, T> | P>

  action<K extends string, T, R>(key: K, f: ActDef0<S, G, C, D, T, R>): Opt<S, G, C, Dispatch0<K, T, R> & D,  P>
  action<K extends string, T, R>(key: K, f: ActDef1<S, G, C, D, T, R>): Opt<S, G, C, Dispatch1<K, T, R> & D,  P>

  module<K extends string, S1, G1 extends BaseGetters, C1 extends BaseCommit, D1 extends BaseDispatch, P1 extends BasePayload>(key: K, o: Opt<S1, G1, C1, D1, P1>): Opt<S & ModuleState<K, S1>, G1 & G, C1 & C, D1 & D, P1 | P>

  plugin(...plugins: Plugin<Store<S, G, C, D, P>>[]): this
  done(): Store<S, G, C, D, P>
}

export interface Store<S, G extends BaseGetters, C extends BaseCommit, D extends BaseDispatch, P extends BasePayload> {
  readonly state: S
  readonly getters: G
  readonly commit: C
  readonly dispatch: D

  subscribe(fn: Subscriber<P, S>): Unsubscription
  watch<R>(getter: VueGetter<S, R>, cb: WatchHandler<never, R>, options: WatchOption<never, R>): Function
  replaceState(state: S): void
}
