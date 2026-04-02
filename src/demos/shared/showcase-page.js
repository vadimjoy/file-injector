const createShowcasePage = () => {
  const controller = new AbortController()
  const { signal } = controller

  const themeToggle = document.getElementById('theme-toggle')
  if (!themeToggle) {
    controller.abort()
    return { destroy: () => {} }
  }

  const frames = document.querySelectorAll('.showcase__iframe')
  if (!frames.length) {
    controller.abort()
    return { destroy: () => {} }
  }

  const setDocumentTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      themeToggle.checked = true
    } else {
      document.documentElement.removeAttribute('data-theme')
      themeToggle.checked = false
    }
  }

  const postThemeToIframes = (theme) => {
    frames.forEach((iframe) => {
      iframe.contentWindow?.postMessage({ type: 'theme', theme }, '*')
    })
  }

  const savedTheme = localStorage.getItem('theme') || 'light'
  setDocumentTheme(savedTheme)

  frames.forEach((iframe) => {
    iframe.addEventListener(
      'load',
      () => {
        if (signal.aborted) return
        const currentTheme = themeToggle.checked ? 'dark' : 'light'
        iframe.contentWindow?.postMessage({ type: 'theme', theme: currentTheme }, '*')
      },
      { signal }
    )
  })

  const onThemeToggle = (event) => {
    if (signal.aborted) return
    const theme = event.target.checked ? 'dark' : 'light'
    setDocumentTheme(theme)
    localStorage.setItem('theme', theme)
    postThemeToIframes(theme)
  }

  const timerId = setTimeout(() => {
    if (!signal.aborted) {
      postThemeToIframes(savedTheme)
    }
  }, 100)

  themeToggle.addEventListener('change', onThemeToggle, { signal })

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
