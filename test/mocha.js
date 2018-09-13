'use strict'

const fs = require('fs'),
  assert = require('assert')
const { 
  AppParam,
  AppResult
} = require('../lib/models/app_dto.js')
const { 
  AppUtil
} = require('../lib/app_util.js')

describe('Array', function () {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      assert.equal([1, 2, 3].indexOf(4), -1)
    })
  })
})

function promisedMap(param, transform) {
  return new Promise(function (resolve, reject) {
    setTimeout(function () {
      resolve(param.data.map(transform))
    }, 1000)
  })
}

describe('async/await', function () {
  describe('echo', function () {
    it('eventually returns the results', function () {
      let input = new AppParam()
      input.data = [1, 2, 3]
      let transform = function (x) { return x * 2; }

      return promisedMap(input, transform)
        .then(function (result) {
          assert.deepEqual(result, [2, 4, 6])

          let input = new AppParam()
          input.data = result
          return promisedMap(input, transform)
        })
        .then(function (result) {
          assert.deepEqual(result, [4, 8, 12])
        })
    })
  })
})