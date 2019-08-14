### 前端项目接入规范命令行工具
可以根据项目需要，选择接入commit msg、eslint和styleint桂发

### 安装
```
npm i fe-standard-cli -g
```

### 命令
addStandard包括命令：
```
-v,--version 命令行工具版本号
-h,--help 帮助

init 前端项目添加规范
update 前端项目更新规范

```

### 使用
在项目根目录下执行命令
```
addStandard init
或者 
addStandard update
```


### 前端项目规范说明
* git commit规范：http://note.youdao.com/noteshare?id=debe89ab4e7b85500264a5825a76776d
* eslint 规范：http://note.youdao.com/noteshare?id=eaadafd7dd4ef2f80a3ffc4fdd37b333
* stylelint规范：http://note.youdao.com/noteshare?id=279a608d87924ea19f1d1d2a30da5763

### todo
* 自动安装依赖包
* 如果项目中存在，添加选择是否更新