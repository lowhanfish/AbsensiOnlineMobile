const asyncForEach = require('../')
const test = require('tape')

test('Does not return an array but an error', function (t) {
  t.plan(2)
  const arr = []

  arr.push(function one (task, array, index, cb) {
    process.nextTick(() => {
      return cb(null, {'one': 'one'})
    })
  })

  arr.push(function two (task, array, index, cb) {
    setTimeout(function () {
      return cb(new Error(), {'two': 'two'})
    }, 1000)
  })

  asyncForEach(arr, (err, res) => {
    t.equal(res, undefined)
    t.ok(err instanceof Error)
  })
})
