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
export interface CH0<K, T> {
  (k: K): MutationHandler0<T>
}
export interface CH1<K, T> {
  (k: K): MutationHandler1<T>
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
export interface DH0<K, T, R> {
  (k: K): ActionHandler0<T, R>
}
export interface DH1<K, T, R> {
  (k: K): ActionHandler1<T, R>
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

export interface Helper<G extends BG, CH extends BCH, DH extends BDH> {
  getters: G
  commit: CH
  dispatch: DH
}


// type bound and implementation type
export type BG = Getters<string, {}>
export type BC = C0<string, {}>
export type BCH = CH0<string, {}>
export type BD = D0<string, {}|void, {}|void>
export type BDH = DH0<string, {}|void, {}|void>
export type BP = P0<string, {}>
export type BaseOpt = Opt<{}, BG, BC, BD, BP, BCH, BDH>
export type BaseStore = Store<{}, BG, BC, BD, BP, BCH, BDH>
export type BasePlugin = Plugin<BaseStore>
export type BaseSubscriber = Subscriber<BP, {}>
export type BaseHelper = Helper<BG, BCH, BDH>


// type level wizardry
export interface Opt<S, G extends BG, C extends BC, D extends BD, P extends BP, CH extends BCH, DH extends BDH> {
  getter<K extends string, T>(key: K, f: GetDef<S, G, T>): Opt<S, Getters<K, T> & G, C, D, P, CH, DH>

  mutation<K extends string, T>(key: K, f: MD0<S, T>): Opt<S, G, C0<K, T> & C, D, P0<K, T> | P, CH0<K, T> & CH, DH>
  mutation<K extends string, T>(key: K, f: MD1<S, T>): Opt<S, G, C1<K, T> & C, D, P1<K, T> | P, CH1<K, T> & CH, DH>

  action<K extends string, T, R>(key: K, f: AD0<S, G, C, D, T, R>): Opt<S, G, C, D0<K, T, R> & D,  P, CH, DH0<K, T, R> & DH>
  action<K extends string, T, R>(key: K, f: AD1<S, G, C, D, T, R>): Opt<S, G, C, D1<K, T, R> & D,  P, CH, DH1<K, T, R> & DH>

  module<K extends string, S1, G1 extends BG, C1 extends BC, D1 extends BD, P1 extends BP, CH1 extends BCH, DH1 extends BDH>(key: K, o: Opt<S1, G1, C1, D1, P1, CH1, DH1>): Opt<S & ModuleState<K, S1>, G1 & G, C1 & C, D1 & D, P1 | P, CH1 & CH, DH1 & DH>

  plugin(...plugins: Plugin<Store<S, G, C, D, P, CH, DH>>[]): this
  done(): Store<S, G, C, D, P, CH, DH>

  state_t: S
  getters_t: G
  commit_t: C
  dispatch_t: D
  payload_t: P
}

export interface Store<S, G extends BG, C extends BC, D extends BD, P extends BP, CH extends BCH, DH extends BDH> {
  readonly state: S
  readonly getters: G
  readonly commit: C
  readonly dispatch: D
  /** @internal */ _helper?: Helper<G, CH, DH>

  subscribe(fn: Subscriber<P, S>): Unsubscription
  watch<R>(getter: VueGetter<S, R>, cb: WatchHandler<never, R>, options?: WatchOption<never, R>): Function
  replaceState(state: S): void
}
