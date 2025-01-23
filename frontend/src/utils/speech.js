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
    this.initialized = false
    // 预加载中文声音
    this.loadVoices()
  }

  // 加载可用的声音
  loadVoices() {
    // 立即尝试获取声音列表
    this.voices = this.synth.getVoices()
    if (this.voices.length > 0) {
      this.initVoice()
      return
    }

    // 某些浏览器需要等待声音列表加载完成
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.voices = this.synth.getVoices()
        this.initVoice()
      }
    }
  }

  // 初始化声音
  initVoice() {
    // 优先使用中文声音
    this.voice = this.voices.find(voice => 
      voice.lang.includes('zh') || 
      voice.lang.includes('cmn') || 
      voice.name.includes('Chinese')
    )
    
    // 如果没有找到中文声音，使用默认声音
    if (!this.voice && this.voices.length > 0) {
      this.voice = this.voices[0]
    }
    
    this.initialized = true
    console.log('已初始化声音:', this.voice)
  }

  // 初始化语音功能（在用户交互时调用）
  init() {
    // 尝试播放一个空白声音来解除浏览器限制
    const utterance = new SpeechSynthesisUtterance('')
    utterance.volume = 0
    this.synth.speak(utterance)
    this.synth.cancel() // 立即取消播放
  }

  // 播放文本
  speak(text) {
    if (!this.synth) return

    // 如果还没有初始化完成，先初始化
    if (!this.initialized) {
      this.loadVoices()
      // 将文本加入队列，等待初始化完成后播放
      this.queue.push(text)
      return
    }

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
    utterance.rate = 0.8  // 降低语速以提高清晰度
    utterance.pitch = 1.0 // 音高
    utterance.volume = 0.8 // 稍微降低音量

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