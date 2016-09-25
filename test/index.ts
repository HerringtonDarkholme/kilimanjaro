import {create, getHelper, Vuex } from '../index'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
import * as Vue from 'vue'
import { Component } from 'av-ts'
chai.use(sinonChai)

const TEST = 'TEST'

describe('Kilimanjaro', () => {
  it('committing mutations', () => {
    const store = create({
      a: 1
    })
    .mutation(TEST, s => (n: number) => {
      s.a += n
    })
    .done()

    store.commit(TEST, 2)
    expect(store.state.a).to.equal(3)
  })

  it('dispatch action, sycn', () => {
    const store = create({
      a: 1
    })
    .mutation(TEST, s => (n: number) => {
      s.a += n
    })
    .action(TEST, ({commit}) => (n: number) => {
      commit(TEST, n)
    })

    .done()
    store.dispatch(TEST, 2)
    expect(store.state.a).to.equal(3)
  })

  it('dispatch action and return Promise', done => {
    const store = create({
      a: 1
    })
    .mutation(TEST, s => (n: number) => {
      s.a += n
    })
    .action(TEST, ({commit}) => (n: number) => new Promise(resolve => {
      setTimeout(() => {
        commit(TEST, n)
        resolve()
      }, 0)
    }))
    .done()

    store.dispatch(TEST, 2).then(() => {
      expect(store.state.a).to.equal(3)
      done()
    })
    expect(store.state.a).to.equal(1)
  })

  it('detect promise error', done => {
    const store = create()
    .action(TEST, _ => () => new Promise((_, reject) => {
      reject('no')
    }))
    .done()

    let spy = sinon.spy()
    let thenSpy = sinon.spy()
    store['_devtoolHook'] = {emit: spy}
    store.dispatch(TEST)
      .then(thenSpy)
      .catch(err => {
        expect(thenSpy).not.to.have.been.called
        expect(err).to.equal('no')
        expect(spy).to.have.been.calledWith('vuex:error', 'no')
      })
      .then(done, done)
  })

  it('getters', () => {
     const store = create({a: 1})
      .getter('hasAny', s => s.a > 1)
      .mutation(TEST, s => (n: number) => s.a += n)
      .action('check', ({getters}) => (v: boolean) => {
        expect(getters('hasAny')).to.equal(v)
      })
      .done()
    expect(store.getters('hasAny')).to.equal(false)
    store.dispatch('check', false)
    store.commit(TEST, 1)
    expect(store.getters('hasAny')).to.equal(true)
    store.dispatch('check', true)
  })

  it('helper: mutation', () => {
    const store = create({count: 0})
      .mutation('inc', s => () => s.count++)
      .mutation('dec', s => () => s.count--)
      .done()
    const { commit } = getHelper(store)
    commit('inc')()
    expect(store.state.count).to.equal(1)
    commit('dec')()
    expect(store.state.count).to.equal(0)
  })

  it('helper: getter', () => {
    const store = create({count: 0})
      .mutation('inc', s => () => s.count++)
      .mutation('dec', s => () => s.count--)
      .getter('hasAny', s => s.count > 0)
      .getter('negative', ({count}) => count < 0)
      .done()
    const { commit, getters } = getHelper(store)
    let hasAnyImpl: any = getters('hasAny')
    let negativeImpl: any = getters('negative')
    expect(hasAnyImpl.__isgetter).to.equal(true)
    expect(negativeImpl.__isgetter).to.equal(true)
    expect(hasAnyImpl()).to.equal(false)
    expect(negativeImpl()).to.equal(false)
    commit('inc')()
    expect(hasAnyImpl()).to.equal(true)
    expect(negativeImpl()).to.equal(false)
    commit('dec')()
    commit('dec')()
    expect(hasAnyImpl()).to.equal(false)
    expect(negativeImpl()).to.equal(true)
  })

  it('helper: action', () => {
    let a = sinon.spy()
    let b = sinon.spy()
    const store = create()
      .action('a', s => a)
      .action('b', s => b)
      .done()

    const {dispatch} = getHelper(store)
    dispatch('a')()
    expect(a).to.have.been.called
    expect(b).not.to.have.been.called
    dispatch('b')()
    expect(b).to.have.been.called
  })

  it('module: mutation', () => {
    const mutation = (s: {a: number}) => (n: number) => {
      s.a += n
    }

    const store = create({a: 1})
      .mutation(TEST, mutation)
      .module('nested', create({a: 2})
        .mutation(TEST, mutation)
        .module('one', create({a: 3})
          .mutation(TEST, mutation))
        .module('nested', create()
          .module('two', create({a: 4})
            .mutation(TEST, mutation))
          .module('three', create({a: 5})
            .mutation(TEST, mutation))))
      .module('four', create({a: 6})
        .mutation(TEST, mutation))
      .done()
    store.commit(TEST, 1)
    expect(store.state.a).to.equal(2)
    expect(store.state.$('nested').a).to.equal(3)
    expect(store.state.$('nested').$('one').a).to.equal(4)
    expect(store.state.$('nested').$('nested').$('two').a).to.equal(5)
    expect(store.state.$('nested').$('nested').$('three').a).to.equal(6)
    expect(store.state.$('four').a).to.equal(7)
  })

  it('module: action', () => {
    let calls = 0
    const makeAction = (n: number) => ({state}: {state: {a: number}}) => () => {
      calls++
      expect(state.a).to.equal(n)
    }
    const store = create({a: 1})
      .action(TEST, makeAction(1))
      .module('nested', create({a: 2})
        .action(TEST, makeAction(2))
        .module('one', create({a: 3})
          .action(TEST, makeAction(3)))
        .module('nested', create()
          .module('two', create({a: 4})
            .action(TEST, makeAction(4)))
          .module('three', create({a: 5})
            .action(TEST, makeAction(5)))))
      .module('four', create({a: 6})
        .action(TEST, makeAction(6)))
      .done()
    store.dispatch(TEST)
    expect(calls).to.equal(6)
  })


  it('module: getters', () => {
    const makeGetter = (n: number) => (s: any, g: any) => {
      expect(g('contant')).to.equal(0)
      expect(s.a).to.equal(n)
      return s.a
    }
    const store = create({a: 1})
      .getter('contant', _ => 0)
      .getter('g1', makeGetter(1))
      .module('nested', create({a: 2})
        .getter('g2', makeGetter(2))
        .module('one', create({a: 3})
          .getter('g3', makeGetter(3)))
        .module('nested', create()
          .module('two', create({a: 4})
            .getter('g4', makeGetter(4)))
          .module('three', create({a: 5})
            .getter('g5', makeGetter(5)))))
      .module('four', create({a: 6})
        .getter('g6', makeGetter(6)))
      .done()

      for (let i of [1, 2, 3, 4, 5, 6]) {
        expect(store.getters(`g${i}` as any)).to.equal(i)
      }
  })

  it('module: dispatch action across module', done => {
    const store = create()
      .module('a', create()
        .action(TEST, s => () => 1))
      .module('b', create()
        .action(TEST, s => () => new Promise(r => r(2))))
      .done()

    store.dispatch(TEST).then(r => {
      expect(r[0]).to.equal(1)
      expect(r[1]).to.equal(2)
      done()
    })
  })

  it('plugins', () => {
    let initState: any
    const mutations: any[] = []
    const store = create({a: 1})
      .mutation(TEST, s => (n: number) => s.a += n)
      .plugin(store => {
        initState = store.state
        store.subscribe((mut, state) => {
          expect(state).to.equal(store.state)
          mutations.push(mut)
        })
      })
      .done()
    expect(initState).to.equal(store.state)
    store.commit(TEST, 2)
    expect(mutations.length).to.equal(1)
    expect(mutations[0].type).to.equal(TEST)
    expect(mutations[0].payload).to.equal(2)
  })

  it('plugin ignore silent mutation', () => {
    const mutations: any[] = []
    const store = create({a: 1})
      .mutation(TEST, s => (n: number) => s.a += n)
      .plugin(store => {
        store.subscribe((mut, state) => {
          expect(state).to.equal(store.state)
          mutations.push(mut)
        })
      })
      .done()
    store.commit(TEST, 2)
    store.commit(TEST, 2, {silent: true})
    expect(mutations.length).to.equal(1)
    expect(mutations[0].type).to.equal(TEST)
    expect(mutations[0].payload).to.equal(2)
    expect(store.state.a).to.equal(5)
  })

  it('watch change in vue', done => {
    const store = create({a: 1})
      .mutation(TEST, s => () => s.a += 1)
      .module('nested', create({a: 2})
        .mutation('inner', s => () => s.a += 1))
      .done()

    let test = 0
    let nested = 0
    let calls = 0
    store.watch(s => s.a, (n, o) => {
      test = n
      calls++
    })
    store.watch(s => s.$('nested').a, (n, o) => {
      nested = n
      calls++
    })
    expect(test).to.equal(0)
    expect(nested).to.equal(0)
    expect(calls).to.equal(0)
    store.commit(TEST)()
    Vue.nextTick(() => {
      expect(test).to.equal(2)
      expect(nested).to.equal(0)
      expect(calls).to.equal(1)
      store.commit('inner')()
      Vue.nextTick(() => {
        expect(test).to.equal(2)
        expect(nested).to.equal(3)
        expect(calls).to.equal(2)
        done()
      })
    })
  })

  it('should annotate component', () => {
    let changed =false
    const store = create({
      a: 1
    })
    .getter('getter', s => s.a + 1)
    .mutation(TEST, s => (n: number) => {
      changed = true
    })
    .done()

    const { getters, commit } = getHelper(store)

    @Component
    class Test extends Vue {
      @Vuex getter = getters('getter')
      @Vuex mut = commit(TEST)
    }

    let tst = new Test()
    expect(tst.getter).to.equal(2)
    tst.mut(12)
    expect(changed).to.equal(true)
  })

})
