;(function() {
  var cache = null
  var index = 0

  var input = document.querySelector('.search__input')
  var results = document.querySelector('.search__results')

  if (!input || !results) return

  input.addEventListener('input', function() {
    var query = this.value.trim().toLowerCase()
    if (!query) { results.style.display = 'none'; return }
    if (!cache) { results.innerHTML = '<div class="search__item">索引加载中...</div>'; results.style.display = 'block'; return }
    doSearch(query)
  })

  input.addEventListener('keydown', function(e) {
    var items = results.querySelectorAll('.search__item')
    if (!items.length) return
    if (e.key === 'Escape') { results.style.display = 'none'; input.blur(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); index = Math.min(index + 1, items.length - 1); highlight(items) }
    if (e.key === 'ArrowUp') { e.preventDefault(); index = Math.max(index - 1, 0); highlight(items) }
    if (e.key === 'Enter') { e.preventDefault(); items[index] && items[index].querySelector('a').click() }
  })

  document.addEventListener('click', function(e) {
    if (!e.target.closest('.search')) results.style.display = 'none'
  })

  input.addEventListener('focus', function() {
    if (cache && input.value.trim()) { results.style.display = 'block' }
  })

  fetch('/search.xml')
    .then(function(res) { return res.text() })
    .then(function(xml) {
      var parser = new DOMParser()
      var doc = parser.parseFromString(xml, 'text/xml')
      var entries = doc.querySelectorAll('entry')
      cache = []
      entries.forEach(function(entry) {
        var title = entry.querySelector('title')
        var url = entry.querySelector('url')
        var content = entry.querySelector('content')
        cache.push({
          title: title ? title.textContent : '',
          url: url ? url.textContent : '',
          content: content ? content.textContent.toLowerCase() : ''
        })
      })
    })

  function doSearch(query) {
    index = 0
    var words = query.split(/\s+/).filter(Boolean)
    var matched = []
    cache.forEach(function(item) {
      var text = (item.title + ' ' + item.content).toLowerCase()
      if (words.every(function(w) { return text.indexOf(w) !== -1 })) {
        matched.push(item)
      }
    })
    if (!matched.length) { results.innerHTML = '<div class="search__item search__item--empty">没有找到结果</div>'; results.style.display = 'block'; return }
    var html = ''
    matched.forEach(function(item) {
      html += '<div class="search__item"><a href="' + item.url + '">' + highlightText(item.title, query) + '</a></div>'
    })
    results.innerHTML = html
    results.style.display = 'block'
  }

  function highlightText(text, query) {
    var words = query.split(/\s+/).filter(Boolean)
    words.forEach(function(w) {
      var re = new RegExp('(' + escapeReg(w) + ')', 'gi')
      text = text.replace(re, '<mark>$1</mark>')
    })
    return text
  }

  function escapeReg(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

  function highlight(items) {
    items.forEach(function(item, i) {
      item.classList.toggle('search__item--active', i === index)
      if (i === index) item.scrollIntoView({ block: 'nearest' })
    })
  }
})()
