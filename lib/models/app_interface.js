'use strict'

const cheerio = require('cheerio')
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
} = require('./app_enum.js')
const { AppResult } = require('./app_dto.js')

/**
 * Base class for SingleRuleParser
 * @class
 */
class SingleRuleParserBase {
  /**
   * @param {int} ruleId - an ruldId defined in RuleSysEnum
   * @constructor
   */
  constructor(ruleId) {
    this.ruleId = ruleId
    this.isCustom = false
    this.ruleFor = []
    this.$ = null //dom object, expect generated from cheerio 
    this.warnings = []

    if (RuleSysEnum.max < this.ruleId)
      this.isCustom = true
  }

  /**
   * Check rules in config which theirs syntax is valdate or not 
   * @param {SingleRuleModel} o -
   * @return {bool} is validate or not
   * @static
   */
  static checkConfigSyntax(o) {
    o = o || {}
    let p = o.pattern > ''
    let f = o.fn > ''
    let r = o.root > ''
    let t = o.tag > ''
    return p && f && r && t
  }

  /**
   * Setup html dom data
   * @param {string} d - Expect a string already translated by translate()
   * @return {SingleRuleParserBase} this
   */
  setupDOMFromHtml(d) {
    this.data = d
    this.$ = cheerio.load(this.data)
    return this
  }

  /**
   * Resolve template string to new string, all keywords replaced
   * @param {string=} src - Expect a template raw string to be translated
   * @param {SingleRuleModel=} ruleFor -
   * @return {string} new string replaced
   */
  translate(src, ruleFor) {
    src = src || ''
    ruleFor = ruleFor || {}
    return (src || '').replace('{{root}}', ruleFor.root || '')
      .replace('{{tag}}', ruleFor.tag || '')
      .replace('{{attr}}', ruleFor.attr || '')
      .replace('{{value}}', ruleFor.value || '')
      .replace('{{min}}', ruleFor.min || 0)
      .replace('{{max}}', ruleFor.max || 0)
  }

  /**
    * Core validate function, check specific DOM exists or not
    * @param {SingleRuleModel} ruleFor - 
    * @param {string} xpath - xpath for dom to parse
    * @param {string} alertMsg - the raw invalid msg from config for a pattern
    * @return {SingleRuleParserBase} this
    */
  checkShouldExist(ruleFor, xpath, alertMsg) {
    let x = this.translate(xpath, ruleFor)
    let isValid = this.$(x).length > 0
    if (isValid)
      return new AppResult().ok()
    else
      return new AppResult().err(StatusCodeEnum.warn, this.translate(alertMsg, ruleFor))
  }

  /**
    * Core validate function, check specific DOM exists or not
    * @param {SingleRuleModel} ruleFor - 
    * @param {string} xpath - xpath for dom to parse
    * @param {string} alertMsg - the raw invalid msg from config for a pattern
    * @return {SingleRuleParserBase} this
    */
  checkShouldNotExist(ruleFor, xpath, alertMsg) {
    let x = this.translate(xpath, ruleFor)
    let isValid = this.$(x).length == 0
    if (isValid)
      return new AppResult().ok()
    else
      return new AppResult().err(StatusCodeEnum.warn, this.translate(alertMsg, ruleFor))
  }

  /**
   * Core validate function, check specific DOM with specific attribute exists or not
   * @param {SingleRuleModel} ruleFor - 
   * @param {string} xpath - xpath for dom to parse
   * @param {string} alertMsg - the raw invalid msg from config for a pattern
   * @return {SingleRuleParserBase} this
   */
  checkShouldMatchTagAttr(ruleFor, xpath, alertMsg) {
    let x = this.translate(xpath, ruleFor)
    this.total = this.$(x).length
    this.isValid = !this.total
    if (isValid)
      return new AppResult().ok()
    else
      return new AppResult().err(StatusCodeEnum.warn, this.translate(alertMsg, ruleFor))
  }

  /**
   * Core validate function, check specific DOM max out specific times or not
   * @param {SingleRuleModel} ruleFor - 
   * @param {string} xpath - xpath for dom to parse
   * @param {string} alertMsg - the raw invalid msg from config for a pattern
   * @return {SingleRuleParserBase} this
   */
  checkMaxOccurrence(ruleFor, xpath, alertMsg) {
    let x = this.translate(xpath, ruleFor)
    let isValid = this.$(x).length <= ruleFor.max
    if (isValid)
      return new AppResult().ok()
    else
      return new AppResult().err(StatusCodeEnum.warn, this.translate(alertMsg, ruleFor))
  }

  /**
   * Load ruleFor settings for this.ruleId
   * @return {SingleRuleParserBase} this
   * @abstract
   */
  loadRuleFromFile() {
    throw new Error('loadRuleFromFile() must be implemented by subclass!')
  }

  /**
    * Core validate function, this.warnings will be refreshed once called
    * @return {AppResult}
    * @abstract
    */
  analysis() {
    throw new Error('analysis() must be implemented by subclass!')
  }
}

/**
 * Base class for SEOValidator
 * @class
 */
class SEOValidatorBase {
  /**
   * @constructor
   */
  constructor() {
    this.reader = null
    this.writer = null
    this.ruleToggles = {}
    this.warnings = []
  }

  /**
   * Initialized to turn off rules number 1~5 and custom
   * @return {SEOValidatorBase} this
   */
  _init() {
    this.ruleToggles[RuleSysEnum.tag_img] = RuleToggleEnum.off
    this.ruleToggles[RuleSysEnum.tag_a] = RuleToggleEnum.off
    this.ruleToggles[RuleSysEnum.tag_head] = RuleToggleEnum.off
    this.ruleToggles[RuleSysEnum.tag_strong] = RuleToggleEnum.off
    this.ruleToggles[RuleSysEnum.tag_h1] = RuleToggleEnum.off

    return this
  }

  /**
   * Turn on/off rules number 1~5 or custom
   * @param {(int[]|string[])} digits - e.g.[1,2,3,4,5] ruleAll when param is 0
   * @param {RuleToggleEnum} flag - RuleToggleEnum.on|RuleToggleEnum.off
   * @return {SEOValidatorBase} this
   */
  ruleUpdate(digits, flag) {
    if (!digits) {
      return super._init()
    }

    for (let idx in digits) {
      // if (this.ruleToggles[`${digits[idx]}`])
      this.ruleToggles[`${digits[idx]}`] = flag
    }

    return this
  }

  /**
   * Turn on rules number 1~5 or custom 
   * @param {(int[]|string[])} d - e.g.,[1,2,3,4,5]
   * @return {SEOValidatorBase} this
   */
  includeRules(d) {
    return this.ruleUpdate(d, RuleToggleEnum.on)
  }

  /**
   * Turn off rules number 1~5 or custom 
   * @param {(int[]|string[])} d - e.g.[1,2,3,4,5]
   * @return {SEOValidatorBase} this
   */
  excludeRules(d) {
    return this.ruleUpdate(d, RuleToggleEnum.off)
  }

  /**
   * Setup this.reader
   * @param {Readable} r - e.g.,ReaderStream
   * @return {SEOValidatorBase} this
   */
  setReader(r) {
    this.reader = r
    return this
  }

  /**
   * Setup this.reader
   * @param {Writable} r - e.g.,WriterStream
   * @return {SEOValidatorBase} this
   */
  setWriter(w) {
    this.writer = w
    return this
  }

}

/**
 * Base class for FileReader, StreamReader... etc
 * @class
 */
class ReaderBase extends Readable {
  /**
   * @constructor
   */
  constructor() {
    super()
    this.data = ''
  }

  /**
   * async read to this.data
   * @return {ReaderBase} this
   * @abstract
   */
  async read() {
    throw new Error('read() must be implemented by subclass!')
  }
}

/**
 * Base class for FileWriter, StreamWriter... etc
 * @class
 */
class WriterBase extends Writable {
  /**
   * @constructor
   */
  constructor() {
    super()
    this.data = ''
  }

  /**
   * Setup this.data
   * @param {string} d - Expect a html alike string
   * @return {WriterBase} this
   */
  setData(d) {
    this.data = d
    return this
  }

  /**
   * async write this.data to
   * @return {WriterBase} this
   * @abstract
   */
  async write() {
    throw new Error('write() must be implemented by subclass!')
  }
}

module.exports = {
  ReaderBase,
  WriterBase,
  SingleRuleParserBase,
  SEOValidatorBase
}