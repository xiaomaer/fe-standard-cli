const path = require("path");
const fs = require("fs");
const readline = require("readline");
const inquirer = require("inquirer");
const exec = require("child_process").execSync;

// 要拷贝的目标所在路径
const srcPath = path.join(__dirname, "..", "template");
const desPath = path.resolve(`${process.cwd()}`);

// 按行读取写入文件
const modifyFile = writePath => {
  // 用来存储结果的变量
  let arr = [];
  //创建文件流
  const readstream = fs.createReadStream("../template/eslint/.eslintrc.js");
  //创建逐行读取
  const rl = readline.createInterface({
    input: readstream
  });
  rl.on("line", function(data) {
    arr.push(data);
  }).on("close", function() {
    fs.writeFileSync(writePath, arr.join("\r\n"), "utf8");
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
        modifyFile(targetFile);
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
  const { type, commit, eslint, stylelint } = answers;
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
      "eslint",
      "babel-eslint",
      "eslint-plugin-react",
      "@beisen/eslint-config-beisenux",
      "prettier",
      "eslint-plugin-prettier",
      "eslint-config-prettier",
      "eslint-plugin-react-hooks",
      "husky",
      "lint-staged"
    ];
    if (type === "typescript react") {
      packages = [
        ...packages,
        "typescript",
        "@typescript-eslint/parser",
        "@typescript-eslint/eslint-plugin"
      ];
    }
  }
  if (stylelint) {
    packages = [
      ...packages,
      "stylelint",
      "stylelint-config-standard",
      "husky",
      "lint-staged"
    ];
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

module.exports = addStandard;
