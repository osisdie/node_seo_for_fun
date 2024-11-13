'use strict'

const fs = require('fs'),
  path = require('path'),
  nconf = require('nconf'),
  assert = require('assert')
const {
  SingleRuleParser,
  SEOValidator
} = require('../lib/seo/seo_validator.js')
const {
  AppUtil,
  CONFIG_FILE_PATH
} = require('../lib/app_util.js')
const CUSTOM_RULEID = 101

describe('AppUtil() requires(/lib/app_util.js)', function () {
  describe('config', function () {
    it(`path ${CONFIG_FILE_PATH} should exist`, function () {
      fs.readFile(CONFIG_FILE_PATH, function (err, data) {
        if (!err) {
          assert.ok(true)
        } else {
          assert.ok(false, err)
        }
      })
    })
  })

  describe.skip('Function setCfgVal()', function () {
    describe(`Set current time`, function () {
      let nowStr = AppUtil.nowToString()

      it(`app:now should be the same after save and load`, function () {
        let resSet = AppUtil.setCfgVal('app:now', nowStr)
        assert.ok(resSet, 'save failed')

        let resGet = AppUtil.getCfgVal('app:now')
        assert.ok(resGet, 'load failed')
        assert.equal(resGet, nowStr, 'load failed')
      })
    })

    describe(`Set custom rule${CUSTOM_RULEID}`, function () {
      let rule101 = [
        {
          "pattern": "seo:pattern:existsAttrVal",
          "fn": "checkShouldExist",
          "root": "head",
          "tag": "meta",
          "attr": "name",
          "value": "robots",
          "min": 1,
          "max": 1
        }
      ]

      it(`seo:rules:rule${CUSTOM_RULEID}:ruleFor should be the same after save and load`, function () {
        let resSet = AppUtil.setCfgVal(`seo:rules:rule${CUSTOM_RULEID}:ruleFor`, rule101)
        assert.ok(resSet, 'save failed')

        let resGet = AppUtil.getCfgVal(`seo:rules:rule${CUSTOM_RULEID}:ruleFor`)
        assert.ok(resGet, 'load failed')
        assert.equal(resGet.length, rule101.length, 'load failed')
      })
    })
  })

  describe('Function getCfgVal()', function () {
    describe('version', function () {
      it('app:version should be 0.1.0', function () {
        let version = AppUtil.getCfgVal('app:version')
        assert.equal(version, '0.1.0')
      })
    })

    let tests = [
      { rule: 1, expected: 1 },
      { rule: 2, expected: 1 },
      { rule: 3, expected: 3 },
      { rule: 4, expected: 1 },
      { rule: 5, expected: 1 }
    ]

    tests.forEach(function (test) {
      describe(`${test.rule}`, function () {
        describe(`seo:rules:rule${test.rule}:ruleFor should have ${test.expected} element(s)`, function () {
          let list = AppUtil.getCfgVal(`seo:rules:rule${test.rule}:ruleFor`)
          assert.ok(list)
          assert.equal(list.length, test.expected)
          list.forEach(function (ruleFor) {
            it('correctly syntax', function () {
              let res = SingleRuleParser.checkConfigSyntax(ruleFor)
              assert.equal(res, true)
            })
          })
        })
      })
    })
  })
})





