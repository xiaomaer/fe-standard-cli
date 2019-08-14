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

// 项目package.json文件添加规范配置
function addConfig(answers) {
  const { commit, eslint, stylelint } = answers;
  const filePath = `${desPath}/package.json`;
  let contents = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let hooks =
    contents.husky && contents.husky.hooks ? contents.husky.hooks : {};
  let lintStaged = contents["lint-staged"] ? contents["lint-staged"] : {};
  if (commit) {
    contents = {
      ...contents,
      config: {
        commitizen: {
          path: "node_modules/@talentui/cz-project-changelog"
        }
      }
    };
    hooks = {
      ...hooks,
      "commit-msg": "commitlint -e $GIT_PARAMS"
    };
  }
  if (eslint || stylelint) {
    hooks = {
      ...hooks,
      "pre-commit": "lint-staged"
    };
  }
  if (eslint) {
    lintStaged = {
      ...lintStaged,
      "**/*.{ts,tsx,js,jsx}": ["eslint --fix", "git add"]
    };
  }
  if (stylelint) {
    lintStaged = {
      ...lintStaged,
      "**/*.{css,scss,less}": ["stylelint --fix", "git add"]
    };
  }
  contents = {
    ...contents,
    husky: {
      hooks
    },
    "lint-staged": Object.keys(lintStaged).length === 0 ? undefined : lintStaged
  };
  fs.writeFileSync(filePath, JSON.stringify(contents, null, 4), "utf8");
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
      // 添加规范文件
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
      // 项目package.json文件中添加规范配置
      if (commit || eslint || stylelint) {
        addConfig(answers);
      }
      // 自动安装规范依赖包
    });
}

module.exports = addStandard;
