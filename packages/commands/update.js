// 更新规则，判断项目中是否存在相应规范，如果存在，根据选择看是否需要替换
const path = require('path');
const fs = require('fs');
const initStandard = require('./util');

const desPath = path.resolve(`${process.cwd()}`);
const files = fs.readdirSync(desPath);

// 配置文件是否存在
const fileIsExist = (file) => {
  for (let i = 0, len = files.length; i < len; i++) {
    if (files[i].includes(file)) {
      return true;
    }
  }
  return false;
};

// 命令行交互提示文字
const eslintTip = fileIsExist('eslint') ? 'eslint规范已存在，是否替换？' : '是否更新eslint规范';
const stylelintTip = fileIsExist('stylelint')
  ? 'stylelint规范已存在，是否替换？'
  : '是否更新stylelint规范';
const commitlintTip = fileIsExist('commitlint')
  ? 'commit msg规范已存在，是否替换？'
  : '是否更新commit msg规范';

const options = [
  /* {
    name: 'type',
    type: 'list',
    message: '项目类型',
    default: 'react',
    choices: ['react', 'typescript react']
  }, */
  {
    name: 'commit',
    type: 'confirm',
    default: true,
    message: commitlintTip
  },
  {
    name: 'eslint',
    type: 'confirm',
    default: true,
    message: eslintTip
  },
  {
    name: 'stylelint',
    type: 'confirm',
    default: true,
    message: stylelintTip
  }
];

function updateStandard() {
  initStandard(options);
}
module.exports = updateStandard;
