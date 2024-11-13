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
} = require('../lib/core/app_fs.js')
const { AppResult } = require('../lib/models/app_dto.js')
const { AppUtil } = require('../lib/app_util.js')
const TEST_WORDS = 'awesome'

describe('ReaderBase() requires(/lib/core/app_fs.js)', function () {
  describe('Function read()', function () {
    describe('FileReader', function () {
      it(`FileReader should return isSuccess, and contains "${TEST_WORDS}" data`, function () {
        let fr = new FileReader(AppUtil.getCfgVal('path:echoFrom'))
        fr.read()
          .then(data => {
            assert.ok(data)
            assert.ok(data.isSuccess)
            assert.ok(fr.data)
          }, err => {
            assert.ok(false, err)
          })
      })
    })

    describe('StreamReader', function () {
      it(`StreamReader should return isSuccess, and contains "${TEST_WORDS}" data`, function () {
        let r = new Readable()
        r.push(TEST_WORDS)
        r.push(null)

        let sr = new StreamReader(r)
        sr.read()
          .then(data => {
            assert.ok(data)
            assert.ok(data.isSuccess)
            assert.equal(sr.data, TEST_WORDS)
          }, err => {
            assert.ok(false, err)
          })
      })
    })
  })
})

describe('WriterBase() requires(/lib/core/app_fs.js)', function () {
  describe('Function write()', function () {
    describe('FileWriter', function () {
      it(`FileWriter should return isSuccess, and contains "${TEST_WORDS}" data`, function () {
        let fw = new FileWriter(AppUtil.getCfgVal('path:echoTo'))
        fw.setData(TEST_WORDS)
          .write()
          .then(data => {
            assert.ok(data)
            assert.ok(data.isSuccess)
            assert.equal(fw.data, TEST_WORDS)
          }, err => {
            assert.ok(false, err)
          })
      })
    })

    describe('WriteStream', function () {
      it(`WriteStream should return isSuccess, and contains "${TEST_WORDS}" data`, function () {
        let w = fs.createWriteStream('test/output/echo.stream.txt.out') // fs.WriteStream
        let sw = new StreamWriter(w)
        sw.setData(TEST_WORDS)
          .write()
          .then(data => {
            assert.ok(data)
            assert.ok(data.isSuccess)
            assert.equal(sw.data, TEST_WORDS)
          }, err => {
            assert.ok(false, err)
          })
      })
    })

    describe('ConsoleWriter', function () {
      it(`ConsoleWriter should return isSuccess, and contains "${TEST_WORDS}" data`, function () {
        let cw = new ConsoleWriter()
        cw.setData(TEST_WORDS)
          .write()
          .then(data => {
            assert.ok(data)
            assert.ok(data.isSuccess)
            assert.equal(cw.data, TEST_WORDS)
          }, err => {
            assert.ok(false, err)
          })
      })
    })
  })
})

