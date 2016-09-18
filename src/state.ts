export class State {
  /** @internal */ avtsModuleState = {}

  constructor(s: any) {
    for (let key of Object.keys(s)) {
      this[key] = s[key]
    }
  }

  $(key: string): any {
    return this.avtsModuleState[key]
  }
}
