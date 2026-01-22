<script setup>
import { ref, computed, onMounted } from 'vue'
import questionsData from '../data/questions.json'

const EXAM_COUNT = 10

const phase = ref('answering') // 'answering' | 'result'
const examQuestions = ref([])
const userAnswers = ref({})
const score = ref(0)

const typeLabels = {
  single: '单选题',
  multiple: '多选题',
  boolean: '判断题'
}

onMounted(() => {
  startExam()
})

function startExam() {
  // 随机抽取50题
  const shuffled = [...questionsData.questions].sort(() => Math.random() - 0.5)
  examQuestions.value = shuffled.slice(0, Math.min(EXAM_COUNT, questionsData.questions.length))
  userAnswers.value = {}
  score.value = 0
  phase.value = 'answering'
}

function setAnswer(questionId, answer) {
  userAnswers.value[questionId] = answer
}

function toggleMultipleAnswer(questionId, option) {
  if (!userAnswers.value[questionId]) {
    userAnswers.value[questionId] = []
  }
  const answers = userAnswers.value[questionId]
  const index = answers.indexOf(option)
  if (index > -1) {
    answers.splice(index, 1)
  } else {
    answers.push(option)
  }
  answers.sort()
}

function submitExam() {
  let correctCount = 0

  examQuestions.value.forEach(q => {
    const userAnswer = userAnswers.value[q.id]
    let isCorrect = false

    if (q.type === 'single') {
      isCorrect = userAnswer === q.answer
    } else if (q.type === 'multiple') {
      if (userAnswer && userAnswer.length === q.answer.length) {
        isCorrect = userAnswer.every(a => q.answer.includes(a))
      }
    } else if (q.type === 'boolean') {
      isCorrect = userAnswer === q.answer
    }

    if (isCorrect) correctCount++
  })

  score.value = Math.round((correctCount / examQuestions.value.length) * 100)
  phase.value = 'result'
}

function isQuestionCorrect(question) {
  const userAnswer = userAnswers.value[question.id]

  if (question.type === 'single') {
    return userAnswer === question.answer
  } else if (question.type === 'multiple') {
    if (!userAnswer || userAnswer.length !== question.answer.length) return false
    return userAnswer.every(a => question.answer.includes(a))
  } else if (question.type === 'boolean') {
    return userAnswer === question.answer
  }
  return false
}

function getCorrectAnswerText(question) {
  if (question.type === 'boolean') {
    return question.answer ? '对' : '错'
  }
  if (question.type === 'multiple') {
    return question.answer.join(', ')
  }
  return question.answer
}

function getUserAnswerText(question) {
  const userAnswer = userAnswers.value[question.id]
  if (!userAnswer) return '未作答'

  if (question.type === 'boolean') {
    return userAnswer ? '对' : '错'
  }
  if (question.type === 'multiple') {
    return userAnswer.join(', ')
  }
  return userAnswer
}

function answeredCount() {
  return Object.keys(userAnswers.value).length
}

function allAnswered() {
  return answeredCount() === examQuestions.value.length
}
</script>

<template>
  <div class="exam-mode">
    <!-- 答题阶段 -->
    <div v-if="phase === 'answering'" class="answering-phase">
      <div class="header-bar">
        <button class="back-btn" @click="$emit('back')">← 返回</button>
        <h2>✍️ 考试模式</h2>
        <span class="progress">{{ answeredCount() }} / {{ examQuestions.length }}</span>
      </div>

      <div class="questions-list">
        <div
          v-for="(q, index) in examQuestions"
          :key="q.id"
          class="question-card"
          :class="{ answered: userAnswers[q.id] !== undefined }"
        >
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-type" :class="q.type">{{ typeLabels[q.type] }}</span>
          </div>

          <p class="question-text">{{ q.question }}</p>

          <!-- 单选题 -->
          <div v-if="q.type === 'single'" class="options">
            <div
              v-for="(option, optIndex) in q.options"
              :key="optIndex"
              class="option"
              :class="{ selected: userAnswers[q.id] === String.fromCharCode(65 + optIndex) }"
              @click="setAnswer(q.id, String.fromCharCode(65 + optIndex))"
            >
              <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>

          <!-- 多选题 -->
          <div v-else-if="q.type === 'multiple'" class="options">
            <div
              v-for="(option, optIndex) in q.options"
              :key="optIndex"
              class="option"
              :class="{ selected: userAnswers[q.id]?.includes(String.fromCharCode(65 + optIndex)) }"
              @click="toggleMultipleAnswer(q.id, String.fromCharCode(65 + optIndex))"
            >
              <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
              <span class="option-text">{{ option }}</span>
            </div>
          </div>

          <!-- 判断题 -->
          <div v-else-if="q.type === 'boolean'" class="options">
            <div
              class="option"
              :class="{ selected: userAnswers[q.id] === true }"
              @click="setAnswer(q.id, true)"
            >
              <span class="option-label">A.</span>
              <span class="option-text">对</span>
            </div>
            <div
              class="option"
              :class="{ selected: userAnswers[q.id] === false }"
              @click="setAnswer(q.id, false)"
            >
              <span class="option-label">B.</span>
              <span class="option-text">错</span>
            </div>
          </div>
        </div>
      </div>

      <div class="submit-section">
        <button
          class="submit-btn"
          :disabled="!allAnswered()"
          @click="submitExam"
        >
          提交答案
        </button>
        <p v-if="!allAnswered()" class="hint">请完成所有题目后再提交</p>
      </div>
    </div>

    <!-- 结果阶段 -->
    <div v-else-if="phase === 'result'" class="result-phase">
      <div class="result-header">
        <button class="back-btn" @click="$emit('back')">← 返回</button>
        <div class="score-card">
          <div class="score-number">{{ score }}</div>
          <div class="score-label">分</div>
        </div>
        <button class="retry-btn" @click="startExam">再来一次</button>
      </div>

      <div class="result-stats">
        <span class="correct">答对: {{ examQuestions.filter(q => isQuestionCorrect(q)).length }} 题</span>
        <span class="wrong">答错: {{ examQuestions.filter(q => !isQuestionCorrect(q)).length }} 题</span>
      </div>

      <div class="questions-list">
        <div
          v-for="(q, index) in examQuestions"
          :key="q.id"
          class="question-card"
          :class="{ correct: isQuestionCorrect(q), wrong: !isQuestionCorrect(q) }"
        >
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-type" :class="q.type">{{ typeLabels[q.type] }}</span>
            <span class="result-mark" :class="{ right: isQuestionCorrect(q), wrong: !isQuestionCorrect(q) }">
              {{ isQuestionCorrect(q) ? '✓ 正确' : '✗ 错误' }}
            </span>
          </div>

          <p class="question-text">{{ q.question }}</p>

          <div class="answer-section">
            <div class="answer-row">
              <span class="label">你的答案:</span>
              <span class="value" :class="{ correct: isQuestionCorrect(q), wrong: !isQuestionCorrect(q) }">
                {{ getUserAnswerText(q) }}
              </span>
            </div>
            <div v-if="!isQuestionCorrect(q)" class="answer-row">
              <span class="label">正确答案:</span>
              <span class="value correct">{{ getCorrectAnswerText(q) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.exam-mode {
  max-width: 900px;
  margin: 0 auto;
}

.header-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e0e0e0;
}

.back-btn {
  background: none;
  border: none;
  font-size: 1rem;
  color: #667eea;
  cursor: pointer;
  padding: 0.5rem 1rem;
}

.back-btn:hover {
  text-decoration: underline;
}

.header-bar h2 {
  flex: 1;
  margin: 0;
}

.progress {
  background: #667eea;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.question-card.answered {
  border-left: 4px solid #667eea;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.question-number {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
}

.question-type {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.question-type.single {
  background: #e3f2fd;
  color: #1976d2;
}

.question-type.multiple {
  background: #fff3e0;
  color: #f57c00;
}

.question-type.boolean {
  background: #f3e5f5;
  color: #7b1fa2;
}

.question-text {
  font-size: 1.05rem;
  line-height: 1.6;
  color: #333;
  margin-bottom: 1rem;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.option:hover {
  background: #e9ecef;
}

.option.selected {
  background: #e8eaf6;
  border-color: #667eea;
}

.option-label {
  font-weight: bold;
  color: #667eea;
  min-width: 24px;
}

.option-text {
  flex: 1;
  color: #333;
}

.submit-section {
  text-align: center;
  padding: 2rem 0;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  border-radius: 30px;
  cursor: pointer;
  transition: transform 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint {
  margin-top: 1rem;
  color: #666;
}

/* 结果样式 */
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.result-header .back-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.result-header .back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  text-decoration: none;
}

.score-card {
  text-align: center;
}

.score-number {
  font-size: 4rem;
  font-weight: bold;
  line-height: 1;
}

.score-label {
  font-size: 1.2rem;
  opacity: 0.9;
}

.retry-btn {
  background: white;
  color: #667eea;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 20px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 500;
}

.retry-btn:hover {
  transform: scale(1.05);
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.result-stats span {
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-weight: 500;
}

.result-stats .correct {
  background: #e8f5e9;
  color: #4caf50;
}

.result-stats .wrong {
  background: #ffebee;
  color: #f44336;
}

.question-card.correct {
  border-left: 4px solid #4caf50;
}

.question-card.wrong {
  border-left: 4px solid #f44336;
}

.result-mark {
  margin-left: auto;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.result-mark.right {
  background: #e8f5e9;
  color: #4caf50;
}

.result-mark.wrong {
  background: #ffebee;
  color: #f44336;
}

.answer-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.answer-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.answer-row .label {
  color: #666;
  min-width: 80px;
}

.answer-row .value {
  font-weight: 500;
}

.answer-row .value.correct {
  color: #4caf50;
}

.answer-row .value.wrong {
  color: #f44336;
}
</style>
