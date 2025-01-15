class SpeechUtil {
  constructor() {
    // 检查浏览器是否支持语音合成
    if (!window.speechSynthesis) {
      console.warn('当前浏览器不支持语音合成')
      return
    }
    this.synth = window.speechSynthesis
    this.lang = 'zh-CN'
    this.speaking = false
    this.queue = []
    // 预加载中文声音
    this.loadVoices()
  }

  // 加载可用的声音
  loadVoices() {
    // 某些浏览器需要等待声音列表加载完成
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.voices = speechSynthesis.getVoices()
        // 找到中文声音
        this.voice = this.voices.find(voice => voice.lang.includes('zh'))
        console.log('已加载声音列表:', this.voices)
        console.log('选择的声音:', this.voice)
      }
    }
  }

  // 播放文本
  speak(text) {
    if (!this.synth) return

    console.log('准备播放文本:', text)
    // 如果正在播放，加入队列
    if (this.speaking) {
      this.queue.push(text)
      return
    }

    this.speaking = true

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = this.lang
    if (this.voice) {
      utterance.voice = this.voice
    }
    utterance.rate = 1.0  // 语速
    utterance.pitch = 1.0 // 音高
    utterance.volume = 1.0 // 音量

    // 添加事件监听
    utterance.onstart = () => console.log('开始播放')
    utterance.onend = () => {
      console.log('播放结束')
      this.speaking = false
      // 检查队列中是否有待播放的文本
      if (this.queue.length > 0) {
        const nextText = this.queue.shift()
        this.speak(nextText)
      }
    }
    utterance.onerror = (event) => {
      console.error('播放出错:', event)
      this.speaking = false
      // 如果是被打断，尝试重新播放
      if (event.error === 'interrupted' && !this.queue.includes(text)) {
        this.queue.unshift(text)
        setTimeout(() => {
          if (!this.speaking && this.queue.length > 0) {
            const nextText = this.queue.shift()
            this.speak(nextText)
          }
        }, 100)
      }
    }

    this.synth.speak(utterance)
  }

  // 停止播放
  stop() {
    this.synth.cancel()
    this.speaking = false
    this.queue = []
  }
}

export default new SpeechUtil() 