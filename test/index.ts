import {create, getHelper} from '../'
import * as chai from 'chai'
import {expect} from 'chai'
import * as sinonChai from 'sinon-chai'
import * as sinon from 'sinon'
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

    store.commit(TEST)(2)
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
      commit(TEST)(n)
    })

    .done()
    store.dispatch(TEST)(2)
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
        commit(TEST)(n)
        resolve()
      }, 0)
    }))
    .done()

    store.dispatch(TEST)(2).then(() => {
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
    store.dispatch(TEST)()
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
    store.dispatch('check')(false)
    store.commit(TEST)(1)
    expect(store.getters('hasAny')).to.equal(true)
    store.dispatch('check')(true)
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
})
