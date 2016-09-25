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

export type WatchHandler<C, T> = (this: C, newVal: T, oldVal: T) => void
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

// mutation definition
export interface MD0<S, T> {
  (s: S): F0<void> & F01<T, void>
}
export interface MD1<S, T> {
  (s: S): F1<T, void>
}
export interface MutationHandler0<T> {
  (this: void, t?: T, opt?: CommitOption): void
}
export interface MutationHandler1<T> {
  (this: void, t: T, opt?: CommitOption): void
}
export interface C0<K, T> {
  (k: K, t?: T, opt?: CommitOption): void
}
export interface C1<K, T> {
  (k: K, t: T, opt?: CommitOption): void
}

// action definition
export interface AD0<S, G, C, D, T, R> {
  (s: ActionStore<S, G, C, D>): F0<Promise<R> | R> & F1<T, Promise<R>|R>
}
export interface AD1<S, G, C, D, T, R> {
  (s: ActionStore<S, G, C, D>): F1<T, Promise<R> | R>
}
export type ActionHandler0<T, R> = F01<T, Promise<R[]>>
export type ActionHandler1<T, R> = F1<T, Promise<R[]>>
export interface D0<K, T, R> {
  (k: K, t?: T): Promise<R[]>
}
export interface D1<K, T, R> {
  (k: K, t: T): Promise<R[]>
}

export interface P0<K, T> {
  type: K
  payload?: T
}
export interface P1<K, T> {
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
export type BG = Getters<string, {}>
export type BC = C0<string, {}>
export type BD = D0<string, {}|void, {}|void>
export type BP = P0<string, {}>
export type BaseOpt = Opt<{}, BG, BC, BD, BP>
export type BaseStore = Store<{}, BG, BC, BD, BP>
export type BasePlugin = Plugin<BaseStore>
export type BaseSubscriber = Subscriber<BP, {}>


// type level wizardry
export interface Opt<S, G extends BG, C extends BC, D extends BD, P extends BP> {
  getter<K extends string, T>(key: K, f: GetDef<S, G, T>): Opt<S, Getters<K, T> & G, C, D, P>

  mutation<K extends string, T>(key: K, f: MD0<S, T>): Opt<S, G, C0<K, T> & C, D, P0<K, T> | P>
  mutation<K extends string, T>(key: K, f: MD1<S, T>): Opt<S, G, C1<K, T> & C, D, P1<K, T> | P>

  action<K extends string, T, R>(key: K, f: AD0<S, G, C, D, T, R>): Opt<S, G, C, D0<K, T, R> & D,  P>
  action<K extends string, T, R>(key: K, f: AD1<S, G, C, D, T, R>): Opt<S, G, C, D1<K, T, R> & D,  P>

  module<K extends string, S1, G1 extends BG, C1 extends BC, D1 extends BD, P1 extends BP>(key: K, o: Opt<S1, G1, C1, D1, P1>): Opt<S & ModuleState<K, S1>, G1 & G, C1 & C, D1 & D, P1 | P>

  plugin(...plugins: Plugin<Store<S, G, C, D, P>>[]): this
  done(): Store<S, G, C, D, P>
}

export interface Store<S, G extends BG, C extends BC, D extends BD, P extends BP> {
  readonly state: S
  readonly getters: G
  readonly commit: C
  readonly dispatch: D

  subscribe(fn: Subscriber<P, S>): Unsubscription
  watch<R>(getter: VueGetter<S, R>, cb: WatchHandler<never, R>, options?: WatchOption<never, R>): Function
  replaceState(state: S): void
}
