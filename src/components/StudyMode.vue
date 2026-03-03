<script setup>
import { ref, onMounted } from 'vue'
import questionsData from '../data/questions.json'

const questions = ref(questionsData.questions)
const targetQuestion = ref('')
const questionRefs = ref([])

const typeLabels = {
  single: '单选题',
  multiple: '多选题',
  boolean: '判断题'
}

// 跳转到指定题目
const jumpToQuestion = () => {
  const index = parseInt(targetQuestion.value) - 1
  if (index >= 0 && index < questions.value.length) {
    const element = questionRefs.value[index]
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // 保存位置
      localStorage.setItem('studyModeLastQuestion', index + 1)
    }
  }
}

// 处理回车键
const handleKeyPress = (e) => {
  if (e.key === 'Enter') {
    jumpToQuestion()
  }
}

// 恢复上次位置
onMounted(() => {
  const lastQuestion = localStorage.getItem('studyModeLastQuestion')
  if (lastQuestion) {
    const index = parseInt(lastQuestion) - 1
    if (index >= 0 && index < questions.value.length) {
      setTimeout(() => {
        const element = questionRefs.value[index]
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    }
  }

  // 监听滚动，自动记录当前浏览到的题目
  const handleScroll = () => {
    const scrollTop = window.scrollY
    const windowHeight = window.innerHeight

    // 找到当前视野中的题目
    for (let i = 0; i < questionRefs.value.length; i++) {
      const element = questionRefs.value[i]
      if (element) {
        const rect = element.getBoundingClientRect()
        const absoluteTop = rect.top + scrollTop

        // 如果题目在屏幕中间位置，记录它
        if (scrollTop > absoluteTop - windowHeight / 2) {
          localStorage.setItem('studyModeLastQuestion', i + 1)
        }
      }
    }
  }

  // 使用节流优化滚动监听
  let scrollTimeout
  const throttledScroll = () => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout)
    }
    scrollTimeout = setTimeout(handleScroll, 100)
  }

  window.addEventListener('scroll', throttledScroll)
})

// 设置题目引用
const setQuestionRef = (el, index) => {
  if (el) {
    questionRefs.value[index] = el
  }
}
</script>

<template>
  <div class="study-mode">
    <div class="header-bar">
      <button class="back-btn" @click="$emit('back')">← 返回</button>
      <h2>📖 备考模式</h2>
      <div class="jump-control">
        <input
          v-model="targetQuestion"
          type="number"
          min="1"
          :max="questions.length"
          placeholder="题号"
          class="jump-input"
          @keypress="handleKeyPress"
        />
        <button class="jump-btn" @click="jumpToQuestion">跳转</button>
      </div>
      <span class="count">共 {{ questions.length }} 道题</span>
    </div>

    <div class="questions-list">
      <div
        v-for="(q, index) in questions"
        :key="q.id"
        :ref="(el) => setQuestionRef(el, index)"
        class="question-card"
        :id="'question-' + (index + 1)"
      >
        <div class="question-header">
          <span class="question-number">{{ index + 1 }}.</span>
          <span class="question-type" :class="q.type">{{ typeLabels[q.type] }}</span>
        </div>

        <p class="question-text">{{ q.question }}</p>

        <div class="options">
          <div
            v-for="(option, optIndex) in q.options"
            :key="optIndex"
            class="option"
            :class="{ correct: isCorrectAnswer(q, optIndex) }"
          >
            <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
            <span class="option-text">{{ option }}</span>
            <span v-if="isCorrectAnswer(q, optIndex)" class="correct-mark">✓ 正确答案</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    isCorrectAnswer(question, optionIndex) {
      const label = String.fromCharCode(65 + optionIndex)
      if (question.type === 'boolean') {
        const correctLabel = question.answer ? 'A' : 'B'
        return label === correctLabel
      }
      if (question.type === 'multiple') {
        return question.answer.includes(label)
      }
      return question.answer === label
    }
  }
}
</script>

<style scoped>
.study-mode {
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

.count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.jump-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.jump-input {
  width: 80px;
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  text-align: center;
}

.jump-input:focus {
  outline: none;
  border-color: #667eea;
}

.jump-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}

.jump-btn:hover {
  background: #5568d3;
}


.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.option.correct {
  background: #e8f5e9;
  border-color: #4caf50;
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

.correct-mark {
  color: #4caf50;
  font-weight: 500;
  font-size: 0.9rem;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .header-bar {
    flex-wrap: wrap;
    gap: 0.5rem;
    padding-bottom: 0.75rem;
  }

  .back-btn {
    padding: 0.35rem 0.6rem;
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .header-bar h2 {
    font-size: 1rem;
    white-space: nowrap;
  }

  .jump-control {
    margin-left: auto;
  }

  .jump-input {
    width: 50px;
    padding: 0.35rem 0.4rem;
    font-size: 0.85rem;
  }

  .jump-btn {
    padding: 0.35rem 0.6rem;
    font-size: 0.8rem;
  }

  .count {
    order: 5;
    display: block;
    margin: 0.25rem auto 0;
    font-size: 0.75rem;
    padding: 0.35rem 0.7rem;
    box-shadow: 0 2px 6px rgba(102, 126, 234, 0.25);
  }

  /* 第一行：返回 + 标题 + 跳转 */
  .back-btn,
  .header-bar h2,
  .jump-control {
    flex-shrink: 0;
  }
}
</style>
