'use strict'

const cheerio = require('cheerio')
const {
  AppResult,
  SingleRuleModel
} = require('../models/app_dto.js')
const {
  SingleRuleParserBase,
  SEOValidatorBase
} = require('../models/app_interface.js')
const {
  RuleSysEnum,
  RuleCustomEnum,
  RuleGroupEnum,
  RuleToggleEnum,
  RuleInputEnum,
  RuleOutputEnum,
  StatusCodeEnum
} = require('../models/app_enum.js')
const {
  FileReader,
  StreamReader,
  ConsoleWriter,
  FileWriter,
  StreamWriter
} = require('../core/app_fs')
const { AppUtil } = require('../app_util.js')

/**
 * Creates a new SEOValidator
 * @class
 */
class SEOValidator extends SEOValidatorBase {
  constructor() {
    super()
    this._init()
  }

  /**
    * test function
    * @return {AppResult}
    * @deprecated since only for test
    */
  async test() {
    return new Promise(function (resolve, reject) {
      let result = new AppResult()
      let that = this
      setTimeout(function () {
        result.ok()
        resolve(result)
      }, 1000)
    })
  }

  /**
   * Core seo validation function
   * @return {AppResult}
   */
  async validate() {
    this.warnings = []
    let that = this

    return new Promise(function (resolve, reject) {
      that._dom_analysis()
      .then(data => {
          return that.flush()
      }, reason => {
        console,error(reason)
        reject(reason)
      }).then(data => {
        let result = new AppResult()
        result.count = that.warnings.length
        result.data = that.warnings
        resolve(result.ok())
      }, reason => {
        console.error(reason)
        reject(reason)
      })
    })
  }

  /**
   * Core validation function
   * @return {AppResult}
   */
  async _dom_analysis() {
    let that = this

    return new Promise(function (resolve, reject) {
      that.reader.read()
      .then( data => {
        for (let ruleId in that.ruleToggles) {
          if (RuleToggleEnum.on != that.ruleToggles[ruleId])
            continue

          let p = new SingleRuleParser(ruleId)
          let r = p.setupDOMFromHtml(that.reader.data).analysis()
          that.warnings = that.warnings.concat(r.data || [])
        }

        let result = new AppResult()
        result.count = that.warnings.length
        result.data = that.warnings
        resolve(result.ok())
      }, reason => {
        console.error(reason)
        reject(reason)
      })
    })
  }

  /**
   * Core validation function
   * @return {AppResult}
   */
  async flush() {
    let that = this

    return new Promise(function (resolve, reject) {
      let s = `[${AppUtil.nowToString()}] Output:\r\n`
      that.writer.setData(s + (that.warnings.join('\r\n') || 'all pass'))
      that.writer.write()
      .then(data => {
        resolve(new AppResult().ok())
      }, reason => {
        console.error(reason)
        reject(reason)
      })
    })
  }
}

/**
 * Creates a new SingleRuleParser
 * @class
 */
class SingleRuleParser extends SingleRuleParserBase {
  /**
   * @param {(int|string)} ruleId - an id defined in RuleSysEnum
   * @constructor
   */
  constructor(ruleId) {
    super(ruleId)
  }

  /**
   * Load ruleFor settings for this.ruleId
   * @return {SingleRuleParser} this
   * @override
   */
  loadRuleFromFile() {
    this.ruleFor = AppUtil.getCfgVal(`seo:rules:rule${this.ruleId}:ruleFor`)
    return this
  }

  /**
   * Core validate function, this.warnings[] will be refreshed once called
   * @return {AppResult}
   * @override
   */
  analysis() {
    this.warnings = []
    let result = new AppResult();
    if (!this.$) {
      let msg = `[SingleRuleParser] this.dom not found. Please setupDOMFromHtml(yourHtmlData) before you call`
      return result.err(StatusCodeEnum.warn, msg)
    }

    let r = AppUtil.getCfgVal(`seo:rules:rule${this.ruleId}`)
    if (!r) {
      let msg = `[SingleRuleParser] seo:rules:rule${this.ruleId} not found`
      return result.err(StatusCodeEnum.warn, msg)
    }

    try {
      for (let i = 0; i < r.ruleFor.length; ++i) {
        if (r.ruleFor[i] && r.ruleFor[i].fn && r.ruleFor[i].pattern) {
          let msg = AppUtil.getCfgVal(r.ruleFor[i].pattern + ':msg')
          let xpath = AppUtil.getCfgVal(r.ruleFor[i].pattern + ':xpath')
          let result = eval(`this.${r.ruleFor[i].fn}`).apply(this, [r.ruleFor[i], xpath, msg])

          if (!result.isSuccess)
            this.warnings.push(result.msg)
        }
      }

      result.count = (this.warnings || []).length
      result.data = this.warnings
      return result.ok()
    } catch (err) {
      return result.err(StatusCodeEnum.error, err)
    }
  }
}

module.exports = {
  SingleRuleParser,
  SEOValidator
}