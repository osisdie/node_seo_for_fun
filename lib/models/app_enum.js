'use strict'

const RuleSysEnum = {
  tag_img: 1,
  tag_a: 2,
  tag_head: 3,
  tag_strong: 4,
  tag_h1: 5,
  max: 100
}  
  
const RuleCustomEnum = {
  tag_robot: 101
}

const RuleToggleEnum = {
  on: 1,
  off: 2
}

const RuleGroupEnum = {
  group_sys: 1,
  group_custom :2
}

const RuleInputEnum = {
  file: 1,
  stream: 2
}

const RuleOutputEnum = {
  file: 1,
  stream: 2,
  console: 3
}
  
const LogLevelEnum = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5
}

const StatusCodeEnum = {
  ok: 0,
  error: 1,
  warn: 2
}
 
module.exports = { 
  RuleSysEnum,
  RuleCustomEnum,
  RuleGroupEnum,
  RuleToggleEnum,
  RuleInputEnum,
  RuleOutputEnum,
  LogLevelEnum,
  StatusCodeEnum
}