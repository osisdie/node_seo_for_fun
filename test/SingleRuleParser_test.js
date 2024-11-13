'use strict'

const fs = require('fs'),
  assert = require('assert')
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
  SingleRuleParser,
  SEOValidator
} = require('../lib/seo/seo_validator')
const {
  AppUtil,
  CONFIG_FILE_PATH
} = require('../lib/app_util.js')
const CUSTOM_RULEID = 101

describe('SingleRuleParser() requires(/lib/seo/seo_validator.js)', function () {
  describe('Function checkConfigSyntax()', function () {
    describe('Default rules 1~5', function () {
      let tests = [
        { rule: 1, expected: 1 },
        { rule: 2, expected: 1 },
        { rule: 3, expected: 3 },
        { rule: 4, expected: 1 },
        { rule: 5, expected: 1 }
      ]

      tests.forEach(function (test) {
        describe(test.rule, function () {
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

    describe('Custom rules', function () {
      let tests = [
        { rule: 101, expected: 1 }
      ]

      tests.forEach(function (test) {
        describe(test.rule, function () {
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

  describe('Function analysis()', function () {
    describe(`1. Detect if any <img /> tag without alt attribute`, function () {
      describe('pass', function () {
        it('should return isSuccess without warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
                <img src="smiley.gif" alt="Smiley face" height="42" width="42">
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_img)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 0)
        })
      })

      describe('NOT pass', function () {
        it('should return isSuccess with warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
                <!-- you cannot pass-->
                <img src="smiley.gif" height="42" width="42"> 
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_img)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 1)
          // AppUtil.colorLog(result.data)
        })
      })
    })

    describe(`2. Detect if any <a /> tag without rel attribute`, function () {
      describe('pass', function () {
        it('should return isSuccess without warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
                <a rel="nofollow" href="http://www.functravel.com/">Cheap Flights</a>
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_a)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 0)
        })
      })

      describe('NOT pass', function () {
        it('should return isSuccess with warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
                <!-- you cannot pass-->
                <a href="https://www.w3schools.com">Visit W3Schools.com!</a>
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_a)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 1)
          // AppUtil.colorLog(result.data)
        })
      })
    })

    describe(`3. Detect having <title>、<meta name="description">、<meta name="keywords"> tags in <head>`, function () {
      describe('pass', function () {
        it('should return isSuccess without warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
                <meta name="description" content="Free Web tutorials">
                <meta name="keywords" content="HTML,CSS,XML,JavaScript">
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_head)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 0)
        })
      })

      describe('NOT pass', function () {
        it('should return isSuccess with warnings', function () {
          let data = `
            <html>
              <head>
                <!-- you cannot pass-->
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_head)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 3)
          // AppUtil.colorLog(result.data)
        })
      })
    })

    describe(`4. Detect if there’re more than 15 <strong> tag in HTML`, function () {
      describe('pass', function () {
        it('should return isSuccess without warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_strong)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 0)
        })

        it('should return isSuccess without warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
              </head>
              <body>
                ${"<strong>Strong text</strong>".repeat(15)}
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_strong)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 0)
        })
      })

      describe('NOT pass', function () {
        it('should return isSuccess with warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
              </head>
              <body>
                <!-- you cannot pass-->
                ${"<strong>Strong text</strong>".repeat(16)}
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_strong)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 1)
          // AppUtil.colorLog(result.data)
        })
      })
    })

    describe(`5. Detect if a HTML have more than one <H1> tag`, function () {
      describe('pass', function () {
        it('should return isSuccess without warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_h1)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 0)
        })
      })

      describe('NOT pass', function () {
        it('should return isSuccess with warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
              </head>
              <body>
                <!-- you cannot pass-->
                ${"<h1>hello</h1>".repeat(2)}
              </body>
            </html>`
          let parser = new SingleRuleParser(RuleSysEnum.tag_h1)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 1)
          // AppUtil.colorLog(result.data)
        })
      })
    })

    describe(`${CUSTOM_RULEID}. CustomRule! Checking <meta name="robots" /> exists`, function () {
      describe('pass', function () {
        it('should return isSuccess without warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
                <meta name="robots" content="noindex,nofollow">
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(CUSTOM_RULEID)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 0)
        })

        it('should return isSuccess without warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
                <meta name="robots" content="index,nofollow">
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(CUSTOM_RULEID)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 0)
        })

        it('should return isSuccess without warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
                <meta name="robots" content="noindex,follow">
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(CUSTOM_RULEID)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 0)
        })
      })

      describe('NOT pass', function () {
        it('should return isSuccess with warnings', function () {
          let data = `
            <html>
              <head>
                <title>HTML Reference</title>
                <!-- you cannot pass-->
              </head>
              <body>
                <h1>hello</h1>
              </body>
            </html>`
          let parser = new SingleRuleParser(CUSTOM_RULEID)
          let result = parser.setupDOMFromHtml(data).analysis()
          assert.ok(result)
          assert.ok(result.isSuccess)
          assert.equal(result.count, 1)
          // AppUtil.colorLog(result.data)
        })
      })
    })
  })
})





