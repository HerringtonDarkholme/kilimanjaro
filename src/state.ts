export default class State {
  /** @internal */ avtsModuleState = {}

  constructor(s: {}) {
    for (let key of Object.keys(s)) {
      this[key] = s[key]
    }
  }

  $(key: string): {} {
    return this.avtsModuleState[key]
  }
}
