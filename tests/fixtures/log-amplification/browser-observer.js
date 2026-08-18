const observer = new MutationObserver((mutations) => {
  console.log(mutations)
})

observer.observe(document.body, { childList: true, subtree: true })
