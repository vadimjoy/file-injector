const THEME_OPTIONS = ['default', 'dark', 'midnight', 'corporate', 'warm']

const normalizeTheme = (value) => {
  if (!value || value === 'light') return 'default'
  return THEME_OPTIONS.includes(value) ? value : 'default'
}

const createShowcasePage = () => {
  const controller = new AbortController()
  const { signal } = controller

  const themeSelect = document.getElementById('theme-select')
  if (!themeSelect) {
    controller.abort()
    return { destroy: () => {} }
  }

  const frames = document.querySelectorAll('.showcase__iframe')
  if (!frames.length) {
    controller.abort()
    return { destroy: () => {} }
  }

  const setDocumentTheme = (value) => {
    const theme = normalizeTheme(value)
    if (theme === 'default') {
      document.documentElement.removeAttribute('data-theme')
    } else {
      document.documentElement.setAttribute('data-theme', theme)
    }
    themeSelect.value = theme
    return theme
  }

  const postThemeToIframes = (theme) => {
    frames.forEach((iframe) => {
      iframe.contentWindow?.postMessage({ type: 'theme', theme }, '*')
    })
  }

  const savedTheme = normalizeTheme(localStorage.getItem('theme'))
  let currentTheme = setDocumentTheme(savedTheme)

  frames.forEach((iframe) => {
    iframe.addEventListener(
      'load',
      () => {
        if (signal.aborted) return
        iframe.contentWindow?.postMessage({ type: 'theme', theme: currentTheme }, '*')
      },
      { signal }
    )
  })

  const onThemeChange = (event) => {
    if (signal.aborted) return
    const theme = setDocumentTheme(event.target.value)
    currentTheme = theme
    localStorage.setItem('theme', theme)
    postThemeToIframes(theme)
  }

  const timerId = setTimeout(() => {
    if (!signal.aborted) {
      postThemeToIframes(currentTheme)
    }
  }, 120)

  themeSelect.addEventListener('change', onThemeChange, { signal })

  return {
    destroy() {
      clearTimeout(timerId)
      controller.abort()
    },
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const page = createShowcasePage()
  if (page?.destroy) {
    window.__showcasePageDestroy = page.destroy
  }
})
