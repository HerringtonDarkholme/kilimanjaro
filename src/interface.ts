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

