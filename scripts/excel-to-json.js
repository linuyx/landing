import XLSX from 'xlsx';
import fs from 'fs';

const EXCEL_FILE = './questions.xlsx';
const OUTPUT_FILE = './src/data/questions.json';

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
  const rawData = XLSX.utils.sheet_to_json(worksheet);

  console.log(`📊 找到 ${rawData.length} 道题目，开始转换...`);

  // 检查前5行的题型值
  console.log('📋 前5行的题型值:', rawData.slice(0, 5).map(r => r['题型']));

  const questions = rawData.map((row, index) => {
    // 题型映射
    const typeMap = {
      '单选': 'single',
      '单选题': 'single',
      '多选': 'multiple',
      '多选题': 'multiple',
      '判断': 'boolean',
      '判断题': 'boolean'
    };

    const rawType = String(row['题型'] || '').trim();
    const type = typeMap[rawType] || 'single';

    // 收集选项（过滤空选项）
    let options = [];
    const optionLabels = ['选项A', '选项B', '选项C', '选项D', '选项E'];

    for (const label of optionLabels) {
      const value = row[label];
      if (value) {
        const strValue = String(value).trim();
        if (strValue) {
          options.push(strValue);
        }
      }
    }

    // 判断题如果没有选项，自动生成"对"和"错"
    if (type === 'boolean' && options.length === 0) {
      options = ['对', '错'];
    }

    // 处理答案
    const rawAnswer = row['答案'];
    let answer = rawAnswer ? String(rawAnswer).trim().toUpperCase() : '';

    // 判断题特殊处理
    if (type === 'boolean') {
      if (answer === '对' || answer === 'T' || answer === 'TRUE') {
        answer = true;
      } else if (answer === '错' || answer === 'F' || answer === 'FALSE') {
        answer = false;
      }
    } else if (type === 'multiple') {
      // 多选题答案拆分成数组
      answer = answer.split(/[,，、]/).map(a => a.trim().toUpperCase()).filter(Boolean);
    }

    return {
      id: index + 1,
      type,
      question: String(row['题干'] || ''),
      options,
      answer
    };
  });

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
