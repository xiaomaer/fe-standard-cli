module.exports = {
  extends: [
    "@beisen/eslint-config/react", //react规则
    // "@beisen/eslint-config/typescript-react", //ts react规则
    // "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "prettier/react",
  ],
  globals: {
    // 这里填入你的项目需要的全局变量
  },
  rules: {
    // 这里填入你的项目需要的个性化配置
  },
  settings: {
    react: {
      version: "latest" // React version. "detect" automatically picks the version you have installed.
      // You can also use `16.0`, `16.3`, etc, if you want to override the detected value.
      // default to latest and warns if missing
      // It will default to "detect" in the future
    }
  }
};
