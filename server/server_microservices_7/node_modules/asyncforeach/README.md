# asyncforeach [![Build Status](https://travis-ci.org/TEDDBerlin/asyncforeach.svg?branch=master)](https://travis-ci.org/TEDDBerlin/asyncforeach) [![Coverage Status](https://coveralls.io/repos/github/TEDDBerlin/asyncforeach/badge.svg?branch=master)](https://coveralls.io/github/TEDDBerlin/asyncforeach?branch=master)

> Lightweight async Array-forEach-method.

## Description

In a microservice world, you want to fire requests in parallel and act on all of
their returns. This can be done very barebones with this tiny module.

For better support and lifetime handling, as well as a better API go to [Steed](https://github.com/mcollina/steed).

## Example

```js
const arr = []

arr.push(function one (task, index, array, cb) {
  process.nextTick(() => {
    return cb(null, {'one': 'one'})
  })
})

arr.push(function two (task, index, array, cb) {
  console.log('calling two')
  setTimeout(function () {
    return cb(null, {'two': 'two'})
  }, 1000)
})


asyncForEach(arr, (err, res) => {
  console.log(err) // null
  console.log(res) // [ {'one': 'one'}, {'two': 'two'} ]
                   // order is guaranteed
})
```

or with an error:

```js
const arr = []

arr.push(function one (task, index, array, cb) {
  process.nextTick(() => {
    return cb(new Error('Simple Error'), {'one': 'one'})
  })
})

arr.push(function two (task, index, array, cb) {
  console.log('calling two')
  setTimeout(function () {
    return cb(new Error(), {'two': 'two'})
  }, 1000)
})


asyncForEach(arr, (err, res) => {
  console.log(err) // err instanceof Error -> true
  console.log(res) // undefined
})
```

## Prior Art

> countless

* `aysnc`
* `Promise`

(WIP)

## License

`MIT`
