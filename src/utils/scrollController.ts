interface ScrollControllerOptions {
  threshold?: number
  scrollDelay?: number
  retryDelays?: number[]
}

export class ScrollController {
  private containerSelector: string
  private options: Required<ScrollControllerOptions>
  private scrollTimer: NodeJS.Timeout | null = null
  private isUserScrolling = false
  private shouldAutoScroll = true
  private isProgrammaticScroll = false

  constructor(containerSelector = '.chat', options: ScrollControllerOptions = {}) {
    this.containerSelector = containerSelector
    this.options = {
      threshold: 100,
      scrollDelay: 100,
      retryDelays: [50, 150],
      ...options
    }
    this.handleScroll = this.handleScroll.bind(this)
  }

  getContainer(): Element | null {
    return document.querySelector(this.containerSelector)
  }

  isAtBottom(): boolean {
    const container = this.getContainer()
    if (!container) return false
    const { threshold } = this.options
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold
  }

  handleScroll() {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
    }
    if (this.isProgrammaticScroll) {
      this.isProgrammaticScroll = false
      return
    }
    this.isUserScrolling = true
    this.shouldAutoScroll = this.isAtBottom()
    this.scrollTimer = setTimeout(() => {
      this.isUserScrolling = false
    }, this.options.scrollDelay)
  }

  async scrollToBottom(force = false) {
    // await new Promise(resolve => setTimeout(resolve, 0)); // Similar to nextTick

    if (!force && !this.shouldAutoScroll) return

    const container = this.getContainer()
    if (!container) return

    this.isProgrammaticScroll = true
    const scrollOptions: ScrollToOptions = {
      top: container.scrollHeight,
      behavior: 'smooth'
    }
    container.scrollTo(scrollOptions)

    this.options.retryDelays.forEach((delay, index) => {
      setTimeout(() => {
        if (force || this.shouldAutoScroll) {
          this.isProgrammaticScroll = true
          const behavior = index === this.options.retryDelays.length - 1 ? 'auto' : 'smooth'
          container.scrollTo({
            top: container.scrollHeight,
            behavior
          })
        }
      }, delay)
    })
  }

  async scrollToBottomStaticForce() {
    const container = this.getContainer()
    if (!container) return
    this.isProgrammaticScroll = true
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'auto'
    })
  }

  enableAutoScroll() {
    this.shouldAutoScroll = true
  }

  disableAutoScroll() {
    this.shouldAutoScroll = false
  }

  getScrollState() {
    return {
      isUserScrolling: this.isUserScrolling,
      shouldAutoScroll: this.shouldAutoScroll,
      isAtBottom: this.isAtBottom()
    }
  }

  cleanup() {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer)
      this.scrollTimer = null
    }
  }

  reset() {
    this.cleanup()
    this.isUserScrolling = false
    this.shouldAutoScroll = true
    this.isProgrammaticScroll = false
  }
}

export const createScrollController = (
  containerSelector: string,
  options?: ScrollControllerOptions
) => {
  return new ScrollController(containerSelector, options)
}

export default ScrollController
