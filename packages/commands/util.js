const path = require("path");
const fs = require("fs");
const readline = require("readline");
const inquirer = require("inquirer");
const exec = require("child_process").execSync;

// 要拷贝的目标所在路径
const srcPath = path.join(__dirname, "..", "template");
const desPath = path.resolve(`${process.cwd()}`);

let isReadline = false;

// 按行读取写入文件
const modifyFile = (readPath, writePath) => {
  isReadline = true;
  let line = 0;
  // 用来存储结果的变量
  let arr = [];
  // 创建文件流
  const readstream = fs.createReadStream(readPath);
  // 创建逐行读取
  const rl = readline.createInterface({
    input: readstream
  });
  rl.on("line", function (data) {
    line += 1;
    if (line === 3) {
      data = `    // ${data.trim()}`;
    }
    if (line === 4 || line === 5) {
      data = data.replace(/\/\/\s*(.*)/, "$1");
    }
    arr.push(data);
  }).on("close", function () {
    fs.writeFileSync(writePath, arr.join("\r\n"), "utf8");
    isReadline = false;
  });
};

// 复制指定目录下的文件到项目根目录
const copyFiles = (sourcePath, type) => {
  const files = fs.readdirSync(sourcePath);
  files.forEach(file => {
    const curPath = `${sourcePath}/${file}`;
    const stat = fs.statSync(curPath);
    if (stat.isFile()) {
      const targetFile = `${desPath}/${file}`;
      // 根据项目类型，修改eslint规则
      if (file === ".eslintrc.js" && type && type === "typescript react") {
        modifyFile(curPath, targetFile);
      } else {
        const contents = fs.readFileSync(curPath, "utf8");
        fs.writeFileSync(targetFile, contents, "utf8");
      }
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
  let lintStaged = contents["lint-staged"] || {};
  let scripts = contents.scripts || {};
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
      "**/*.{ts,tsx,js,jsx,css,scss,less}": ["prettier --write"],
      "**/*.{ts,tsx,js,jsx}": ["eslint --fix"]
    };
    scripts = {
      ...scripts,
      "lint:es": "eslint --fix --ext .ts,tsx,js,jsx src",
      "format": "prettier --write **/*.{ts,tsx,js,jsx,css,scss,less}",
    }
  }
  if (stylelint) {
    lintStaged = {
      ...lintStaged,
      "**/*.{css,scss,less}": ["stylelint --fix"]
    };
    scripts = {
      ...scripts,
      "lint:style": "stylelint --fix **/*.{css,scss,less}",
    }
  }
  contents = {
    ...contents,
    scripts,
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
      "@talentui/cz-project-changelog",
      "husky"
    ];
  }
  if (eslint) {
    packages = [
      ...packages,
      "@beisen/eslint-config",
      "@beisen/prettier-config",
      "eslint-config-prettier",
      "prettier", "husky",
      "lint-staged"
    ];
  }
  if (stylelint) {
    packages = [
      ...packages,
      "@beisen/stylelint-config",
      "husky",
      "lint-staged"
    ];
  }
  // 数组去重
  const filterPackages = packages.filter(item => packages.indexOf(item) === packages.lastIndexOf(item))
  execNpmInstall(filterPackages);
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
      // 【注意：需要按行读取文件完成才可以触发，不然导致readline line等事件不执行】
      const t = setInterval(() => {
        if (!isReadline) {
          installPackages(answers);
          clearInterval(t);
        }
      }, 100);
    }
  });
}

module.exports = initStandard;
