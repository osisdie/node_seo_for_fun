'use strict'

const fs = require('fs'),
  nconf = require('nconf')
const {
  RuleSysEnum,
  RuleCustomEnum,
  RuleGroupEnum,
  RuleToggleEnum,
  RuleInputEnum,
  RuleOutputEnum,
  LogLevelEnum,
  StatusCodeEnum
} = require('./models/app_enum.js')
const {
  FileReader,
  StreamReader,
  ConsoleWriter,
  FileWriter,
  StreamWriter
} = require('./core/app_fs')
const { AppResult } = require('./models/app_dto.js')
const CONFIG_FILE_PATH = 'conf/config.json'
nconf.argv()
  .env()
  .file({ file: CONFIG_FILE_PATH })

/**
 * AppUtil collects lots of app utilities
 * @class
 * @static
 */
class AppUtil {
  /**
   * @constructor
   */
  constructor() {
  }

  /**
   * Format new Date() toString(yyyy-MM-dd HH:mm:ss)
   * @return {string} json object of this key
   * @static
   */  
  static nowToString() {
    let d = new Date()
    return d.getFullYear() + "-" +
      ("00" + (d.getMonth() + 1)).slice(-2) + "-" + 
      ("00" + d.getDate()).slice(-2) + " " + 
      ("00" + d.getHours()).slice(-2) + ":" + 
      ("00" + d.getMinutes()).slice(-2) + ":" + 
      ("00" + d.getSeconds()).slice(-2)
  } 

  /**
   * Core config getter function
   * @param {string} k - path to get config key
   * @return {object} json object of this key
   * @static
   */
  static getCfgVal(k) {
    return nconf.get(k)
  }

  /**
   * Core config setter function
   * @param {string} k - path to set config
   * @param {string} v - json object value to of this key
   * @return {bool} save successfully or not
   * @static
   */
  static setCfgVal(k, v) {
    nconf.set(k, v)
    return nconf.save()
  }

  /**
   * Factory to create a reader object
   * @param {BuildAppFsRequest} req - ingredient to create a reader
   * @return {ReaderBase} a new instance derived from ReaderBase 
   * @static
   */
  static createReader(req) {
    switch (req.kind) {
      case RuleInputEnum.file: // 1
        return new FileReader(req.path)
      case RuleInputEnum.stream: // 2
        return new StreamReader(req.stream)
      default:
        return new FileReader(nconf.get('path:input'))
    }
  }

  /**
   * Factory to create a writer object
   * @param {BuildAppFsRequest} req - ingredient to create a writer
   * @return {WriterBase} a new instance derived from WriterBase 
   * @static
   */
  static createWriter(req) {
    switch (req.kind) {
      case RuleOutputEnum.file: // 1
        return new FileWriter(req.path)
      case RuleOutputEnum.stream: // 2
        return new StreamWriter(req.stream)
      case RuleOutputEnum.console: // 3
        return new ConsoleWriter()
      default:
        return new ConsoleWriter()
    }
  }
}
/**
 * Set default logLevel: debug
 */
AppUtil.loglevel = LogLevelEnum.debug

/**
 * AppUtil.Log with different color
 * @param {string} d - message to be console.log 
 * @static
 */
AppUtil.Log = {
  c: function(d) {
    if (LogLevelEnum.info >= AppUtil.loglevel)
      console.log('\x1b[36m', d, '\x1b[0m')
  },

  d: function(d){
    if (LogLevelEnum.debug >= AppUtil.loglevel)
      console.debug(d)
  },

  l: function(d){
    if (LogLevelEnum.info >= AppUtil.loglevel)
      console.log(d)
  },

  w: function(d){
    if (LogLevelEnum.warn >= AppUtil.loglevel)
      console.warn(d)
  },

  e: function(d){
    if (LogLevelEnum.error >= AppUtil.loglevel)
      console.error(d)
  }
}

module.exports = {
  AppUtil,
  CONFIG_FILE_PATH
}