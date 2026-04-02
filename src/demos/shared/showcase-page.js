document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle')
  if (!themeToggle) return

  const frames = document.querySelectorAll('.showcase__iframe')

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
    iframe.addEventListener('load', () => {
      const currentTheme = themeToggle.checked ? 'dark' : 'light'
      iframe.contentWindow?.postMessage({ type: 'theme', theme: currentTheme }, '*')
    })
  })

  themeToggle.addEventListener('change', (event) => {
    const theme = event.target.checked ? 'dark' : 'light'
    setDocumentTheme(theme)
    localStorage.setItem('theme', theme)
    postThemeToIframes(theme)
  })

  setTimeout(() => postThemeToIframes(savedTheme), 100)
})
