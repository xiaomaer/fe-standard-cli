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
      const contents = fs.readFileSync(curPath, "utf8");
      fs.writeFileSync(targetFile, contents, "utf8");
    }
  });
};
// 初始化配置文件
const initConfigFile = answers => {
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
};

// 项目package.json文件添加规范配置
const addConfig = answers => {
  const { commit, eslint, stylelint } = answers;
  const filePath = `${desPath}/package.json`;
  let contents = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let hooks =
    contents.husky && contents.husky.hooks ? contents.husky.hooks : {};
  let lintStaged = contents["lint-staged"] ? contents["lint-staged"] : {};
  let scripts = contents.scripts || {};
  if (commit) {
    contents = {
      ...contents,
      config: {
        commitizen: {
          "path": "cz-conventional-changelog"
        }
      }
    };
    hooks = {
      ...hooks,
      "commit-msg": "commitlint -e $GIT_PARAMS"
    };
    scripts = {
      ...scripts,
      "commit": "git-cz",
    }
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
      "src/**/*.{ts,tsx,js,jsx}": ["eslint"]
    };
    scripts = {
      ...scripts,
      "lint:script": "eslint --ext .ts,tsx,js,jsx src",
      "fix:script": "eslint --fix --ext .ts,tsx,js,jsx src",
      "format": "prettier --write src/**/*.{ts,tsx,js,jsx,css,scss,less}",
    }
  }
  if (stylelint) {
    lintStaged = {
      ...lintStaged,
      "src/**/*.{css,scss,less}": ["stylelint"]
    };
    scripts = {
      ...scripts,
      "lint:style": "stylelint src/**/*.{css,scss,less}",
      "fix:style": "stylelint --fix src/**/*.{css,scss,less}",
    }
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
// 安装依赖包
const execNpmInstall = packagesList => {
  const packages = packagesList.join("  ");
  const npmCommand = `npm install ${packages} -D`;
  console.log("正在安装依赖包....");
  console.log("安装命令:", npmCommand);
  exec(npmCommand, { stdio: "inherit" });
};
// 根据添加的规范，安装响应的包
const installPackages = answers => {
  const { commit, eslint, stylelint } = answers;
  let packages = [];
  if (commit) {
    packages = [
      ...packages,
      "commitizen",
      "@commitlint/cli",
      "@commitlint/config-conventional",
      "cz-conventional-changelog",
    ];
  }
  if (eslint || stylelint) {
    packages = [
      ...packages,
      "@umijs/fabric",
      "prettier",
    ];
  }
  if (commit || eslint || stylelint) {
    packages = [
      ...packages,
      "husky"
    ]
  };
  execNpmInstall(packages);
};

function initStandard(options) {
  inquirer.prompt(options).then(answers => {
    const { commit, eslint, stylelint } = answers;
    if (commit || eslint || stylelint) {
      // 初始化规范配置文件
      initConfigFile(answers);
      // 项目package.json文件中添加规范配置
      addConfig(answers);
      // 自动安装规范依赖包
      installPackages(answers);
    }
  });
}

module.exports = initStandard;
