<script setup>
import { ref, computed } from 'vue'
import questionsData from '../data/questions.json'

const questions = ref(questionsData.questions)

const typeLabels = {
  single: '单选题',
  multiple: '多选题',
  boolean: '判断题'
}

const getAnswerText = (question) => {
  if (question.type === 'boolean') {
    return question.answer ? '对' : '错'
  }
  if (question.type === 'multiple') {
    return question.answer.join(', ')
  }
  return question.answer
}
</script>

<template>
  <div class="study-mode">
    <div class="header-bar">
      <button class="back-btn" @click="$emit('back')">← 返回</button>
      <h2>📖 备考模式</h2>
      <span class="count">共 {{ questions.length }} 道题</span>
    </div>

    <div class="questions-list">
      <div
        v-for="(q, index) in questions"
        :key="q.id"
        class="question-card"
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
  color: #666;
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
</style>
