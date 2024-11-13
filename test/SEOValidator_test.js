'use strict'

const fs = require('fs'),
  assert = require('assert')
const {
  Stream,
  Readable,
  Writable,
  finished
} = require('stream')
const {
  RuleSysEnum,
  RuleCustomEnum,
  RuleGroupEnum,
  RuleToggleEnum,
  RuleInputEnum,
  RuleOutputEnum,
  StatusCodeEnum
} = require('../lib/models/app_enum.js')
const {
  FileReader,
  StreamReader,
  ConsoleWriter,
  FileWriter,
  StreamWriter
} = require('../lib/core/app_fs')
const {
  AppParam,
  AppResult,
  SingleRuleModel
} = require('../lib/models/app_dto.js')
const {
  SingleRuleParser,
  SEOValidator
} = require('../lib/seo/seo_validator')
const { AppUtil } = require('../lib/app_util.js')
const CUSTOM_RULEID = 101
let NO_PASS_DATA = `
<html>
  <head>
    <title>HTML Reference</title>
    <meta name="description" content="Free Web tutorials">
    <meta name="keywords" content="HTML,CSS,XML,JavaScript">
  </head>
  <body>
    <h1>hello</h1>
    <h1>hello</h1>
  </body>
</html>`

describe('SEOValidator() requires(/lib/seo/seo_validator.js)', function () {
  describe('Function validate()', function () {
    describe('pass, input:file, output:file', function () {
      let pass_tests = [
        {
          rule: [1],
          input: RuleInputEnum.file, ffrom: 'test/input/rule1_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule1_pass.out',
          expected: 0
        },
        {
          rule: [2],
          input: RuleInputEnum.file, ffrom: 'test/input/rule2_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule2_pass.out',
          expected: 0
        },
        {
          rule: [3],
          input: RuleInputEnum.file, ffrom: 'test/input/rule3_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule3_pass.out',
          expected: 0
        },
        {
          rule: [4],
          input: RuleInputEnum.file, ffrom: 'test/input/rule4_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule4_pass.out',
          expected: 0
        },
        {
          rule: [5],
          input: RuleInputEnum.file, ffrom: 'test/input/rule5_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule5_pass.out',
          expected: 0
        },
        {
          rule: [1, 2, 3, 4, 5],
          input: RuleInputEnum.file, ffrom: 'test/input/rule12345_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule12345_pass.out',
          expected: 0
        },
        {
          rule: [CUSTOM_RULEID],
          input: RuleInputEnum.file, ffrom: 'test/input/custom_pass',
          output: RuleOutputEnum.file, fto: 'test/output/custom_pass.out',
          expected: 0
        }
      ]

      pass_tests.forEach(function (test) {
        describe(`read:${test.ffrom}, write:${test.fto}`, function () {
          it(`rule${test.rule.join(',')} should have ${test.expected} warning(s)`, function () {
            let validator = new SEOValidator()
              .includeRules(test.rule)
              .setReader(AppUtil.createReader({ kind: test.input, path: test.ffrom }))
              .setWriter(AppUtil.createWriter({ kind: test.output, path: test.fto }))

            return validator.validate()
              .then(result => {
                assert.ok(result)
                assert.ok(result.isSuccess)
                assert.equal(result.count, test.expected)
              }, err => {
                assert.ok(false, err)
              })
          })
        })
      })
    })

    describe('NOT pass, input:file, output:file', function () {
      let no_pass_tests = [
        {
          rule: [1],
          input: RuleInputEnum.file, ffrom: 'test/input/rule1_not_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule1_not_pass.out',
          expected: 1
        },
        {
          rule: [2],
          input: RuleInputEnum.file, ffrom: 'test/input/rule2_not_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule2_not_pass.out',
          expected: 1
        },
        {
          rule: [3],
          input: RuleInputEnum.file, ffrom: 'test/input/rule3_not_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule3_not_pass.out',
          expected: 3
        },
        {
          rule: [4],
          input: RuleInputEnum.file, ffrom: 'test/input/rule4_not_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule4_not_pass.out',
          expected: 1
        },
        {
          rule: [5],
          input: RuleInputEnum.file, ffrom: 'test/input/rule5_not_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule5_not_pass.out',
          expected: 1
        },
        {
          rule: [1, 2, 3, 4, 5],
          input: RuleInputEnum.file, ffrom: 'test/input/rule12345_not_pass',
          output: RuleOutputEnum.file, fto: 'test/output/rule12345_not_pass.out',
          expected: 7
        },
        {
          rule: [CUSTOM_RULEID],
          input: RuleInputEnum.file, ffrom: 'test/input/custom_not_pass',
          output: RuleOutputEnum.file, fto: 'test/output/custom_not_pass.out',
          expected: 1
        }
      ]

      no_pass_tests.forEach(function (test) {
        describe(`read:${test.ffrom}, write:${test.fto}`, function () {
          it(`rule${test.rule.join(',')} should have ${test.expected} warning(s)`, function () {
            let validator = new SEOValidator()
              .includeRules(test.rule)
              .setReader(AppUtil.createReader({ kind: test.input, path: test.ffrom }))
              .setWriter(AppUtil.createWriter({ kind: test.output, path: test.fto }))

            return validator.validate()
              .then(result => {
                assert.ok(result)
                assert.ok(result.isSuccess)
                assert.equal(result.count, test.expected)
              }, err => {
                assert.ok(false, err)
              })
          })
        })
      })
    })

    describe('NOT pass, input:stream, output:file', function () {
      it('https://google.com.tw returns 3 warning(s)', async function () {
        let r = fs.createReadStream('test/input/https___google_com_tw')
        let validator = new SEOValidator()
          .includeRules([1, 2, 3, 4, 5])
          .setReader(AppUtil.createReader({ kind: RuleInputEnum.stream, stream: r }))
          .setWriter(AppUtil.createWriter({ kind: RuleOutputEnum.file, path: 'test/output/https___google_com_tw.out' }))

        return validator.validate()
          .then(result => {
            assert.ok(result)
            assert.ok(result.isSuccess)
            assert.equal(result.count, 3)
            assert.deepEqual(result.data, [
              'This HTML without <a rel> tag',
              'This HTML without <meta name="description"> tag',
              'This HTML without <meta name="keywords"> tag'
            ])
          }, err => {
            assert.ok(false, err)
          })
      })

      it('validate rule1~5 returns 1 warning(s)', function () {
        let r = new Readable()
        r.push(NO_PASS_DATA)
        r.push(null)

        let validator = new SEOValidator()
          .includeRules([1, 2, 3, 4, 5])
          .setReader(AppUtil.createReader({ kind: RuleInputEnum.stream, stream: r }))
          .setWriter(AppUtil.createWriter({ kind: RuleOutputEnum.file, path: 'test/output/stream_writer.out' }))

        return validator.validate()
          .then(result => {
            assert.ok(result)
            assert.ok(result.isSuccess)
            assert.equal(result.count, 1)
            assert.deepEqual(result.data, [
              'This HTML have more than 1 <h1> tag'
            ])
          }, err => {
            assert.ok(false, err)
          })
      })
    })

    describe('NOT pass, input:stream, output:stream', function () {
      it('validate rule1~5 and custom rule returns 2 warning(s)', function () {
        let r = new Readable()
        r.push(NO_PASS_DATA)
        r.push(null)

        let w = fs.createWriteStream('test/output/stream_to_stream.out') // fs.WriteStream
        let validator = new SEOValidator()
          .includeRules([1, 2, 3, 4, 5, CUSTOM_RULEID])
          .setReader(AppUtil.createReader({ kind: RuleInputEnum.stream, stream: r }))
          .setWriter(AppUtil.createWriter({ kind: RuleOutputEnum.stream, stream: w }))

        return validator.validate()
          .then(result => {
            assert.ok(result)
            assert.ok(result.isSuccess)
            assert.equal(result.count, 2)
            assert.deepEqual(result.data, [
              'This HTML have more than 1 <h1> tag',
              'This HTML without <meta name="robots"> tag'
            ])
          }, err => {
            assert.ok(false, err)
          })
      })
    })

    describe('NOT pass, input:stream, output:console', function () {
      it('https://google.com.tw returns 3 warning(s)', async function () {
        let r = fs.createReadStream('test/input/https___google_com_tw')
        let validator = new SEOValidator()
          .includeRules([1, 2, 3, 4, 5])
          .setReader(AppUtil.createReader({ kind: RuleInputEnum.stream, stream: r }))
          .setWriter(AppUtil.createWriter({ kind: RuleOutputEnum.console }))

        return validator.validate()
          .then(result => {
            assert.ok(result)
            assert.ok(result.isSuccess)
            assert.equal(result.count, 3)
            assert.deepEqual(result.data, [
              'This HTML without <a rel> tag',
              'This HTML without <meta name="description"> tag',
              'This HTML without <meta name="keywords"> tag'
            ])
          }, err => {
            assert.ok(false, err)
          })
      })
    })
  })
})


