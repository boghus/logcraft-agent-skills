const observer = new MutationObserver((mutations) => {
  if (!window.DEBUG_LOGGING) return

  const sample = mutations.slice(0, 10)
  console.debug('mutation sample', sample)
})

observer.observe(document.body, { childList: true, subtree: true })
