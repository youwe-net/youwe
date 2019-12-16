const e = new V('#app', {
    name: '友维网络',
    title: '专注web与互联技术'
})
let showToTop = false;

function checkTop(e) {
    if (e > 200 && !showToTop) {
        console.log('show totop')
        const t = document.querySelector('#totop')
        if (t) {
            t.style.display = "block"
        }
        showToTop = true
    } else if (e < 200 && showToTop) {
        console.log('hide totop')
        const t = document.querySelector('#totop')
        if (t) {
            t.style.display = "none"
        }
        showToTop = false
    }
}
uistore.once('load', e => {
    checkTop(e.top); new List('comp-major', {
        class: 'comp-major',
        list: ['hybrid app', 'web网站', '移动网站', '小程序', '服务器程序']
    })
})
uistore.on('scroll', checkTop)