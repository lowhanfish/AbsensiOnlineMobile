const asyncForEach = require('../')
const test = require('tape')

test('without data', function (t) {
  t.plan(3)
  const arr = []

  arr.push(function one (task, index, array, cb) {
    process.nextTick(() => {
      return cb(null, {'one': 'one'})
    })
  })

  arr.push(function two (task, index, array, cb) {
    setTimeout(function () {
      return cb(null, {'two': 'two'})
    }, 1000)
  })

  asyncForEach(arr, (err, res) => {
    t.equal(err, null)
    t.deepEqual(res[0], {'one': 'one'})
    t.deepEqual(res[1], {'two': 'two'})
  })
})

test('with data', function (t) {
  t.plan(5)
  const arr = []

  arr.push(function one (task, index, array, data, cb) {
    t.equal(data.data1, 'data1')
    process.nextTick(() => {
      return cb(null, {'one': 'one'})
    })
  })

  arr.push(function two (task, index, array, data, cb) {
    t.equal(data.data1, 'data1')
    setTimeout(function () {
      return cb(null, {'two': 'two'})
    }, 1000)
  })

  asyncForEach(arr, { 'data1': 'data1' }, (err, res) => {
    t.equal(err, null)
    t.deepEqual(res[0], {'one': 'one'})
    t.deepEqual(res[1], {'two': 'two'})
  })
})
