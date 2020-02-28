### 前端项目接入规范命令行工具

可以根据项目需要，选择接入 commit msg、eslint 和 styleint 规范，代码质量规使用@umijs/fabric。

### 安装

```
npm i fe-standard-cli -g
```

### 命令

afs 包括命令：

```
-v,--version 命令行工具版本号
-h,--help 帮助

init 前端项目添加规范，不判断项目中是否包括该规范，直接添加
update 前端项目更新规范，判断项目中是否包含该规范，如果存在，选择是否覆盖，不进行比对更新【因为规范依赖标准可能不一致】

```

### 使用

在项目根目录下执行命令

```
afs init
或者
afs update
```

### webpack 添加支持

#### 1、eslint

安装

```
npm install eslint-loader -D
```

webpack 添加配置 rules

```
        rules: [
            {
                test: /\.(ts|js)x?$/,
                loader: 'eslint-loader',
                enforce: 'pre',
                include: __SRC
            },
        ]
```

### 2、stylelint

安装

```
npm i -D stylelint-webpack-plugin
```

webpack 添加配置：

```
const StyleLintPlugin = require('stylelint-webpack-plugin');

module.exports = {
    ...
    'plugins': [
        ...
        new StyleLintPlugin({
            files: ['**/*.{css,less,sass,scss}'],
            cache: true,
            emitErrors: true
        })
    ]
};

```

### vscode 配置

在保存文件时，自动检验代码并修复，vs code 配置如下：

- 安装 prettier、eslint、stylelint 扩展
- settings.json 添加配置如下：

```
{
    "eslint.autoFixOnSave": true,
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "html",
        {
            "language": "vue",
            "autoFix": true
        },
        {
            "language": "typescript",
            "autoFix": true
        },
        {
            "language": "typescriptreact",
            "autoFix": true
        }
    ],
    "editor.formatOnSave": true,
}

```

### 前端项目规范说明

使用@umijs/fabric 代码规范配置。详细规范请参考：https://github.com/umijs/fabric
