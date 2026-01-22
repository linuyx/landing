<script setup>
import { ref } from 'vue'
import StudyMode from './components/StudyMode.vue'
import ExamMode from './components/ExamMode.vue'
import questionsData from './data/questions.json'

const mode = ref(null) // 'study' | 'exam' | null

const totalQuestions = questionsData.questions.length
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>📚 备考系统</h1>
      <p class="subtitle">题库共 {{ totalQuestions }} 道题</p>
    </header>

    <main class="main">
      <!-- 首页：选择模式 -->
      <div v-if="!mode" class="mode-selector">
        <div class="mode-card" @click="mode = 'study'">
          <div class="icon">📖</div>
          <h2>备考模式</h2>
          <p>浏览所有题目，查看正确答案</p>
        </div>

        <div class="mode-card" @click="mode = 'exam'">
          <div class="icon">✍️</div>
          <h2>考试模式</h2>
          <p>随机抽50题，测试你的掌握程度</p>
        </div>
      </div>

      <!-- 备考模式 -->
      <StudyMode v-else-if="mode === 'study'" @back="mode = null" />

      <!-- 考试模式 -->
      <ExamMode v-else-if="mode === 'exam'" @back="mode = null" />
    </main>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.header h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.subtitle {
  opacity: 0.9;
}

.main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.mode-selector {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.mode-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mode-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.mode-card h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.mode-card p {
  color: #666;
}
</style>
