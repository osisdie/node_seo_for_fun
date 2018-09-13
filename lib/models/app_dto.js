'use strict'

/**
 * Creates a new AppParam
 * @class
 */
class AppParam {
  /**
   * @constructor
   */ 
  constructor() {
    this.msg = ''
    this.data = null
  }
}

/**
 * Creates a new AppResult
 * @class
 */
class AppResult {
  /**
   * @constructor
   */ 
  constructor() {
    this.isSuccess = false
    this.code = -1 // init
    this.msg = ''
    this.count = 0
    this.data = null
  }
  
  /**
   * Set result is successful and with msg if needed
   * @param {string=} msg - extra message
   * @return {AppResult} this
   */  
  ok (msg) {
    this.isSuccess = true
    this.code = 0 // success
    this.msg = msg || ''
    return this
  }
  
  /**
   * Set result is failed and with code and msg if needed
   * @param {(int|string)=} code - extra StatusCodeEnum status code
   * @param {string=} msg - extra message
   * @return {AppResult} this
   */    
  err (code, msg) {
    this.isSuccess = false
    this.code = code || 1 // common error
    this.msg = msg || ''
    return this
  }

  /**
   * Get this.data
   * @return {AppResult} this
   */    
  getdata() {
    return this.data
  }
  
  /**
   * Set this.data
   * @param {(int|string)} val - result data
   * @return {AppResult} this
   */    
  setdata(val) {
    this.data = val
    return this
  }
}

/**
 * Creates a new SingleRuleModel
 * @class
 */
class SingleRuleModel {
  /**
   * @constructor
   */ 
  constructor() {    
    this.root = null
    this.tag = null    
    this.attr = null
    this.value = null
    this.min = 0
    this.max = 0
  }  
}

/**
 * Creates a new BuildAppFsRequest
 * @class
 */
class BuildAppFsRequest {
  /**
   * @constructor
   */ 
  constructor() {    
    this.kind = null
    this.path = null    
    this.stream = null
  }  
}

module.exports = { 
  AppParam,
  AppResult,
  SingleRuleModel
}