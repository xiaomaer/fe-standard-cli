// 测试脚本
const addStandard = require("./packages/commands/init");
addStandard();

/* const fs = require("fs");
const readline = require("readline");
const modifyFile = writePath => {
  let line = 0;
  // 用来存储结果的变量
  let arr = [];
  //创建文件流
  const readstream = fs.createReadStream(
    "./packages/template/eslint/.eslintrc.js"
  );
  //创建逐行读取
  const rl = readline.createInterface({
    input: readstream
  });
  rl.on("line", function(data) {
    line += 1;
    if (line === 5) {
      data = `    // ${data.trim()}`;
    }
    if (line === 6 || line === 7) {
      data = data.replace(/\/\/\s*(.*)/, "$1");
    }
    arr.push(data);
  }).on("close", function() {
    fs.writeFileSync(writePath, arr.join("\r\n"), "utf8");
  });
};

modifyFile("./test.js"); */
