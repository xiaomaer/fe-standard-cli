const initStandard = require("./util");
const options = [
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
];
function addStandard() {
  initStandard(options);
}
module.exports = addStandard;
