const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const exec = require("child_process").execSync;

// 要拷贝的目标所在路径
const srcPath = path.join(__dirname, "..", "template");
const desPath = path.resolve(`${process.cwd()}`);

// 复制指定目录下的文件到项目根目录
const copyFiles = (sourcePath, type) => {
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
};

// 项目package.json文件添加规范配置
const addConfig = answers => {
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
};
const execNpmInstall = packagesList => {
  const packages = packagesList.join("  ");
  exec(`npm install ${packages} -D`, { stdio: "inherit" });
};
// 根据添加的规范，安装响应的包
const installPackages = answers => {
  const { type, commit, eslint, stylelint } = answers;
  let packages = [];
  if (commit) {
    packages = packages.concat(
      ...[
        "commitizen",
        "@commitlint/cli",
        "@commitlint/config-conventional",
        "@talentui/cz-project-changelog"
      ]
    );
  }
  if (eslint) {
    if (type === "react") {
      packages = packages.concat(
        ...[
          "eslint",
          "babel-eslint",
          "eslint-plugin-react",
          "@beisen/eslint-config-beisenux"
        ]
      );
    } else {
      packages = packages.concat(
        ...[
          "eslint",
          "babel-eslint",
          "typescript",
          "@typescript-eslint/parser",
          "@typescript-eslint/eslint-plugin",
          "eslint-plugin-react",
          "@beisen/eslint-config-beisenux"
        ]
      );
    }
  }
  if (stylelint) {
    packages = packages.concat(
      ...["stylelint", "stylelint-config-stand", "husky", "lint-staged"]
    );
  }
  execNpmInstall(packages);
};

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
      if (commit || eslint || stylelint) {
        // 项目package.json文件中添加规范配置
        addConfig(answers);
        // 自动安装规范依赖包
        execNpmInstall(answers);
      }
    });
}

module.exports = addStandard;
