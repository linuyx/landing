# 备考系统

基于 Vue 3 的备考/考试系统，支持备考模式和考试模式。

## 功能

- **备考模式**：浏览所有题目，直接显示正确答案
- **考试模式**：随机抽50题，答题后评分并展示错题

## 安装

```bash
npm install
```

## 使用 Excel 题库

1. 将 Excel 题库文件命名为 `questions.xlsx` 放在项目根目录
2. Excel 格式要求：

| 序号 | 题型 | 题干 | 选项A | 选项B | 选项C | 选项D | 选项E | 答案 |
|------|------|------|-------|-------|-------|-------|-------|------|
| 1    | 单选 | ...  | ...   | ...   | ...   | ...   |       | A    |
| 2    | 多选 | ...  | ...   | ...   | ...   | ...   |       | A,B  |
| 3    | 判断 | ...  | 对    | 错    |       |       |       | 对   |

- 题型：`单选`、`多选`、`判断`
- 单选题答案：`A`、`B`、`C`、`D`、`E` 之一
- 多选题答案：多个字母用逗号分隔，如 `A,B,C`
- 判断题答案：`对` 或 `错`

3. 运行转换命令：

```bash
npm run convert
```

转换后题库将保存在 `src/data/questions.json`

## 运行

```bash
npm run dev
```

访问 http://localhost:5173

## 项目结构

```
src/
├── components/
│   ├── StudyMode.vue   # 备考模式组件
│   └── ExamMode.vue    # 考试模式组件
├── data/
│   └── questions.json  # 题库数据
├── App.vue             # 主应用组件
├── main.js             # 入口文件
└── style.css           # 全局样式
scripts/
└── excel-to-json.js    # Excel 转 JSON 工具
```
