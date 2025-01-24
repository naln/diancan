class SpeechUtil {
  constructor() {
    // 检查浏览器是否支持语音合成
    if (!window.speechSynthesis) {
      alert('当前浏览器不支持语音合成')
      return
    }
    this.synth = window.speechSynthesis
    this.lang = 'zh-CN'
    this.speaking = false
    this.queue = []
    this.initialized = false
    this.mobileInitialized = false
    this.audioContext = null
    // 预加载中文声音
    this.loadVoices()
  }

  // 加载可用的声音
  loadVoices() {
    // 在移动设备上，需要在用户交互时初始化
    if (this.isMobile() && !this.mobileInitialized) {
      return
    }

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

  // 检查是否为移动设备
  isMobile() {
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
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

  // 初始化音频上下文
  initAudioContext() {
    try {
      if (typeof window.AudioContext !== 'undefined') {
        this.audioContext = new window.AudioContext()
      } else if (typeof window.webkitAudioContext !== 'undefined') {
        this.audioContext = new window.webkitAudioContext()
      }
      
      if (this.audioContext) {
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        gainNode.gain.value = 0
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        oscillator.start(0)
        oscillator.stop(0.1)
      }
    } catch (error) {
      console.error('音频上下文初始化失败:', error)
    }
  }

  // 初始化语音功能（在用户交互时调用）
  init() {
    this.mobileInitialized = true
    try {
      this.initAudioContext()
      this.loadVoices()
      
      const utterance = new SpeechSynthesisUtterance('测试语音')
      utterance.volume = 0  // 测试语音静音
      utterance.rate = 1
      utterance.pitch = 1

      if (this.voice) {
        utterance.voice = this.voice
      }

      if (this.synth.paused) {
        this.synth.resume()
      }
      
      this.synth.cancel()
      this.synth.speak(utterance)
    } catch (error) {
      console.error('语音初始化失败:', error)
    }
  }

  // 封装成功的语音播放方法
  async speakWithDelay(text) {
    return new Promise((resolve, reject) => {
      try {
        // 创建语音对象
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.volume = 1  // 最大音量
        utterance.rate = 1    // 正常语速
        utterance.pitch = 1   // 正常音调
        
        if (this.voice) {
          utterance.voice = this.voice
        }
        
        // 设置回调
        utterance.onend = () => {
          this.speaking = false
          resolve()
        }
        
        utterance.onerror = (e) => {
          this.speaking = false
          reject(new Error('语音播放失败: ' + e.error))
        }
        
        // 确保语音合成服务处于活动状态
        if (this.synth.paused) {
          this.synth.resume()
        }
        
        // 确保没有其他语音在播放
        this.synth.cancel()
        
        // 延迟播放
        setTimeout(() => {
          this.speaking = true
          this.synth.speak(utterance)
        }, 500)
      } catch (error) {
        reject(error)
      }
    })
  }

  // 播放文本
  speak(text) {
    if (!this.synth) {
      console.error('语音系统未初始化')
      return
    }

    // 如果是移动设备且未初始化，将文本加入队列
    if (this.isMobile() && !this.mobileInitialized) {
      console.error('移动设备需要先初始化语音系统')
      // 确保音频上下文已经初始化
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }
      this.loadVoices()
      this.queue.push(text)
      return
    }

    // 确保语音合成服务处于活动状态
    if (this.synth.paused) {
      this.synth.resume()
    }

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
    utterance.rate = 1      // 使用正常语速
    utterance.pitch = 1.0   // 音高
    utterance.volume = 1    // 使用最大音量

    // 添加事件监听
    utterance.onstart = () => {
      // 确保音频上下文处于激活状态
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }
      // 确保不会被系统打断
      if ('wakeLock' in navigator) {
        navigator.wakeLock.request('screen').catch(() => {})
      }
    }
    
    utterance.onend = () => {
      console.log('播放结束:', text)
      this.speaking = false
      // 检查队列中是否有待播放的文本
      if (this.queue.length > 0) {
        const nextText = this.queue.shift()
        this.speak(nextText)
      }
    }

    utterance.onerror = (event) => {
      console.error('播放出错:', event.error)
      this.speaking = false
      // 记录详细错误信息
      console.error('错误详情:', {
        error: event.error,
        message: event.message,
        elapsedTime: event.elapsedTime,
        charIndex: event.charIndex,
        name: event.name
      })
      
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

    try {
      this.synth.speak(utterance)
    } catch (error) {
      console.error('语音播放失败:', error)
      this.speaking = false
    }
  }

  // 停止播放
  stop() {
    if (this.synth) {
      this.synth.cancel()
      this.speaking = false
      this.queue = []
    }
  }
}

export default new SpeechUtil() 