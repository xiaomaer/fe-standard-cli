#!/usr/bin/env node
const program = require("commander");
const packageJson = require("../package.json");

const init = require("../packages/commands/init");
const update = require("../packages/commands/update");

program
  .version(packageJson.version, "-v,--version")
  .command("init")
  .description("添加前端项目规范")
  .action(init);

program
  .command("update")
  .description("更新前端项目规范")
  .action(update);

program.parse(process.argv);
