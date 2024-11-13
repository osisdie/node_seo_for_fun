### node_seo_for_fun
---
Node application to parse HTML DOM document, validate its SEO scores, and show some alerting message for recommendation.

*series of code_for_fun*

### Pre-requsites
---
- Node.js 8.0 or higher version


### Installation
---
After clone, install all dependencies
```sh
$ npm install
```
Install BDD test framework: **mocha**
```sh
$ npm install --global mocha
```
* or as a development dependency for your project:
```sh
$ npm install --save-dev mocha
```
*Note: Mocha currently requires Node.js v6.x or newer.*


### Config your rules
---
We have SEO rules defined in config file (**default**: config/config.json)

* Default SEO syntax patterns
```json
"seo": {
    "pattern": {
      "existsTag": {
        "xpath": "{{root}} {{tag}}",
        "msg": "This HTML without <{{tag}}> tag"
      },
      "existsAttr": {
        "xpath": "{{root}} {{tag}}[{{attr}}]",
        "msg": "This HTML without <{{tag}} {{attr}}> tag"
      },
      "existsNoAttr": {
        "xpath": "{{root}} {{tag}}:not([{{attr}}])",
        "msg": "This HTML without <{{tag}} {{attr}}> tag"
      },
      "existsAttrVal": {
        "xpath": "{{root}} {{tag}}[{{attr}}*={{value}}]",
        "msg": "This HTML without <{{tag}} {{attr}}=\"{{value}}\"> tag"
      },
      "tagCountLessThan": {
        "xpath": "{{root}} {{tag}}",
        "msg": "This HTML have more than {{max}} <{{tag}}> tag"
      }
    }
}
```

* prdefined SEO rules 1~5
* define a custom rule 101

```json
"seo": {
    "rules": {
      "rule1": {
        "ruleFor": [
          {
            "pattern": "seo:pattern:existsNoAttr",
            "fn": "checkShouldNotExist",
            "root": "html",
            "tag": "img",
            "attr": "alt"
          }
        ]
      },
      "rule2": {
        "ruleFor": [
          {
            "pattern": "seo:pattern:existsNoAttr",
            "fn": "checkShouldNotExist",
            "root": "html",
            "tag": "a",
            "attr": "rel"
          }
        ]
      },
      "rule3": {
        "ruleFor": [
          {
            "pattern": "seo:pattern:existsTag",
            "fn": "checkShouldExist",
            "root": "head",
            "tag": "title",
            "min": 1,
            "max": 1
          },
          {
            "pattern": "seo:pattern:existsAttrVal",
            "fn": "checkShouldExist",
            "root": "head",
            "tag": "meta",
            "attr": "name",
            "value": "description",
            "min": 1,
            "max": 1
          },
          {
            "pattern": "seo:pattern:existsAttrVal",
            "fn": "checkShouldExist",
            "root": "head",
            "tag": "meta",
            "attr": "name",
            "value": "keywords",
            "min": 1,
            "max": 1
          }
        ]
      },
      "rule4": {
        "ruleFor": [
          {
            "pattern": "seo:pattern:tagCountLessThan",
            "fn": "checkMaxOccurrence",
            "root": "html",
            "tag": "strong",
            "max": 15,
            "min": 0
          }
        ]
      },
      "rule5": {
        "ruleFor": [
          {
            "pattern": "seo:pattern:tagCountLessThan",
            "fn": "checkMaxOccurrence",
            "root": "html",
            "tag": "h1",
            "max": 1,
            "min": 0
          }
        ]
      },
      "rule101": {
        "ruleFor": [
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
      }
    }
}
```


### Unit Test
---
Test static AppUtil class usage, Most default SEO rules were predefined in config file (**default**: config/config.json). You'll see how to access them,

* setCfgVal(): set a pair kv property to config file (**default**: config/config.json)
* getCfgVal(): load a pair kv property from config file (**default**: config/config.json)

```sh
$ npm test ./test/AppUtil_test.js
```

Reader and writer classes usage.

* super classes: ReaderBase, WriterBase
* derived from ReaderBase: FileReader, StreamReader
* derived from WriterBase: FileWriter, WriteStream, ConsoleWriter

```sh
$ npm test./test/app_fs_test.js
```

To unittest each rule's setttings and syntax. We simply create SingleRuleParser class, then checkConfigSyntax(). You got true of the syntax is valid.
```sh
$ npm test ./test/SingleRuleParser.js
```

The high level SEO validator class: SEOValidator. We have test profolio bundled,

* rules 1,2,3,4,5,101, you can includeRules() or excludeRules() on demand
* an input, output channel, and its necessary property (such as path or data)
* some HTML examples under /downloads folder

```sh
$ npm test ./test/SEOValidator_test.js
```


### Run the App
---
Dowanload a html document from https://wwww.google.com.tw, store to this path for example, /test/input/www.google.com.tw.html

test.js
```js
let readStream = fs.createReadStream('test/input/www.google.com.tw.html')
let validator = new SEOValidator()
  .includeRules([1, 2, 3, 4, 5])
  .setReader(AppUtil.createReader({ kind: RuleInputEnum.stream, stream: readStream }))
  .setWriter(AppUtil.createWriter({ kind: RuleOutputEnum.file, path: 'test/output/www.google.com.tw.html.out' }))

return validator.validate()
  .then(function (result) {
    assert.ok(result)
    assert.ok(result.isSuccess)
    assert.equal(result.count, 3)
    assert.deepEqual(result.data, [
      'This HTML without <a rel> tag',
      'This HTML without <meta name="description"> tag',
      'This HTML without <meta name="keywords"> tag'
    ])
  })
```
  > Check it out the output data in the path 'test/output/www.google.com.tw.html.out' would match the rule and its corresponsive message


### Create your own custom Rule
---
You can easily create a new rule, some hints are here:
 * rule number should start after 101 (1~100 would be reseved for system default rules), and put "rule" as this integer's prefix, then rule101, for example, would be the full qualified ruleId

 * Combine your **tag**, **attribute**, **value**, or even **occurrences** as your new rule content

 * Be aware of **pattern** property is a real path points to config, so we expect  "seo:pattern:existsAttrVal" is where rule declares its DOM xpath and alart message

 * The last part would be **fn** property. That would be runtime evaluated to execute a function declared in the class of SingleRuleParser/SingleRuleParserBase (which means you can create your syntax fn if needed)

config.json
```json
"seo": {
    "rules": {
      "rule101": {
        "ruleFor": [
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
      }
    }
  }
```

*Enjoy this **node_seo_for_fun** project*
