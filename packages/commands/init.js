const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");

// 要拷贝的目标所在路径
const srcPath = path.join(__dirname, "..", "template");
const desPath = path.resolve(`${process.cwd()}`);

// 复制指定目录下的文件到项目根目录
function copyFiles(sourcePath, type) {
  const files = fs.readdirSync(sourcePath);
  files.forEach(file => {
    const curPath = `${sourcePath}/${file}`;
    const stat = fs.statSync(curPath);
    if (stat.isFile()) {
      const targetFile = `${desPath}/${file}`;
      let contents = fs.readFileSync(curPath, "utf8");
      // 根据项目类型，修改eslint规则
      if (file === ".eslintrc.js" && type && type === "typescript react") {
        contents = contents.replace(
          "@beisen/eslint-config-beisenux/react",
          "@beisen/eslint-config-beisenux/typescript-react"
        );
      }
      fs.writeFileSync(targetFile, contents, "utf8");
    }
  });
}

function addStandard() {
  inquirer
    .prompt([
      {
        name: "type",
        type: "list",
        message: "项目类型",
        default: "react",
        choices: ["react", "typescript react"]
      },
      {
        name: "commit",
        type: "confirm",
        default: true,
        message: "是否添加commit msg规范"
      },
      {
        name: "eslint",
        type: "confirm",
        default: true,
        message: "是否添加eslint规范"
      },
      {
        name: "stylelint",
        type: "confirm",
        default: true,
        message: "是否添加stylelint规范"
      }
    ])
    .then(answers => {
      const { type, commit, eslint, stylelint } = answers;
      if (commit) {
        copyFiles(`${srcPath}/commit`);
      }
      if (eslint) {
        copyFiles(`${srcPath}/eslint`, type);
        copyFiles(`${srcPath}/prettier`);
      }
      if (stylelint) {
        copyFiles(`${srcPath}/stylelint`);
      }
    });
}

module.exports = addStandard;
