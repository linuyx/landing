import XLSX from 'xlsx';
import fs from 'fs';

const EXCEL_FILE = './questions.xlsx';
const OUTPUT_FILE = './src/data/questions.json';

const typeMap = {
  '单选题': 'single',
  '多选题': 'multiple',
  '判断题': 'boolean'
};

const requiredHeaders = ['序号', '试题内容', '题型', '选项A', '选项B', '选项C', '选项D', '选项E', '选项F', '正确答案'];
const optionLabels = ['选项A', '选项B', '选项C', '选项D', '选项E', '选项F'];

function clean(value) {
  return String(value ?? '').trim();
}

function validateHeaders(worksheet) {
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  const headers = (rows[0] || []).map(clean);
  const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    console.error('❌ Excel 表头不符合新题库格式');
    console.error(`缺少表头: ${missingHeaders.join(', ')}`);
    console.error(`当前表头: ${headers.join(', ')}`);
    process.exit(1);
  }
}

function normalizeAnswer(rawAnswer, type) {
  const answerText = clean(rawAnswer).toUpperCase();

  if (type === 'boolean') {
    if (['对', '正确', 'T', 'TRUE', 'A'].includes(answerText)) return true;
    if (['错', '错误', 'F', 'FALSE', 'B'].includes(answerText)) return false;
    return answerText;
  }

  const letters = answerText.match(/[A-F]/g) || [];

  if (type === 'multiple') {
    return [...new Set(letters)];
  }

  return letters[0] || answerText;
}

function normalizeRow(row, index) {
  const rowNumber = index + 2;
  const rawType = clean(row['题型']);
  const type = typeMap[rawType];

  if (!type) {
    console.error(`❌ 第 ${rowNumber} 行题型不支持: ${rawType || '(空)'}`);
    process.exit(1);
  }

  const question = clean(row['试题内容']);
  if (!question) {
    console.error(`❌ 第 ${rowNumber} 行试题内容为空`);
    process.exit(1);
  }

  const options = optionLabels
    .map((label) => clean(row[label]))
    .filter(Boolean);

  return {
    type,
    question,
    options: type === 'boolean' && options.length === 0 ? ['对', '错'] : options,
    answer: normalizeAnswer(row['正确答案'], type)
  };
}

function convertExcelToJson() {
  if (!fs.existsSync(EXCEL_FILE)) {
    console.error(`❌ 找不到文件: ${EXCEL_FILE}`);
    console.log('请将 Excel 题库文件命名为 questions.xlsx 并放在项目根目录');
    process.exit(1);
  }

  console.log('📖 读取 Excel 文件...');
  const workbook = XLSX.readFile(EXCEL_FILE);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  validateHeaders(worksheet);

  const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

  console.log(`📊 找到 ${rawData.length} 道题目，开始转换...`);

  const normalizedRows = rawData.map(normalizeRow);
  console.log('📋 前5行的题型值:', normalizedRows.slice(0, 5).map(r => r.type));

  const questions = normalizedRows.map((row, index) => ({
    id: index + 1,
    ...row
  }));

  // 确保输出目录存在
  const outputDir = './src/data';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 写入 JSON 文件
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ questions }, null, 2), 'utf-8');

  console.log(`✅ 转换完成！`);
  console.log(`📁 输出文件: ${OUTPUT_FILE}`);
  console.log(`📈 统计:`);
  console.log(`   - 单选题: ${questions.filter(q => q.type === 'single').length} 道`);
  console.log(`   - 多选题: ${questions.filter(q => q.type === 'multiple').length} 道`);
  console.log(`   - 判断题: ${questions.filter(q => q.type === 'boolean').length} 道`);
}

convertExcelToJson();
