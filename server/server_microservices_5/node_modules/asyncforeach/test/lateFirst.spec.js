'use strict'
const asyncForEach = require('../')
const test = require('tape')

test('first call will return much later than the first', function (t) {
  t.plan(5)
  const arr = []
  let count = 2

  arr.push(function one (task, index, array, cb) {
    setTimeout(function () {
      t.equal(--count, 0)
      return cb(null, {'one': 'one'})
    }, 200)
  })

  arr.push(function two (task, index, array, cb) {
    process.nextTick(() => {
      t.equal(--count, 1)
      return cb(null, {'two': 'two'})
    })
  })

  asyncForEach(arr, (err, res) => {
    t.equal(err, null)
    t.deepEqual(res[0], {'one': 'one'})
    t.deepEqual(res[1], {'two': 'two'})
  })
})
