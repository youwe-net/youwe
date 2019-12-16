
function emptyObject() {
    return Object.create(null)
}
// 一个响应式文本内容，利用id绑定内部内容
function V(el, data) {
    this.el = document.querySelector(el)
    this.raw = data
    this.els = {}
    for (const e in data) {
        if (typeof data[e] !== 'string') continue
        const d = document.querySelector('#' + e)
        if (!d) continue
        if (this[e]) {
            console.warn(`${e} 已经存在于实例`)
            continue
        }
        this.els[e] = d
        d.innerText = data[e]
        Object.defineProperty(this, e, {
            get: () => {
                return this.raw[e]
            },
            set: v => {
                if (this.raw[e] !== v) {
                    this.els[e].innerText = v
                }
            }
        })
    }
}
V.prototype.set = function (name, val) {
    if (this.raw[name] !== undefined) {
        this.data[name] = val
    }
}
// 列表组件 
class List {
    constructor(el, data) {
        if (typeof el === "string") {
            el = document.querySelector('#' + el)
        }
        if (!el instanceof Element) return console.warn(`列表没有父元素，请绑定ul/ol元素`)
        for (const li of data.list) {
            const t = document.createElement('li')
            t.className = data.class || ''
            t.innerHTML = li
            el.appendChild(t)
        }
    }
}
class EventStore {
    constructor() {
        this.handlers = {}
    }
    // 绑定事件监听器，初步支持一次性事件
    on(name, cb, options = {}) {
        let t = this.handlers[name]
        if (!t) {
            t = { n: [], once: [] }
            this.handlers[name] = t
        }
        if (options.once) {
            return t.once.push(cb)
        }
        t.n.push(cb)
    }
    // 绑定一次性事件监听器，主要是页面级别事件，例如加载成功...
    once(name, cb) {
        let t = this.handlers[name]
        if (!t) {
            t = []
            this.handlers[name] = t
        }
        t.push(cb)
    }
    // 去除事件监听器
    off(name, cb) {
        const t = this.handlers[name]
        if (t) {
            if (cb) {
                let i = t.n.findIndex(e => e === cb)
                if (i > -1) {
                    return t.n.splice(i, 1)
                }
                i = t.once.findIndex(e => e === cb)
                if (i > -1) {
                    return t.once.splice(i, 1)
                }
            }
            delete this.handlers[name]
            return
        }
    }
    // 触发事件
    emit(name, data) {
        const t = this.handlers[name]
        if (Array.isArray(t)) {
            t.forEach(e => e(data))
            return delete this.handlers[name]
        }
        if (t) {
            if (t.once.length > 0) {
                t.once.forEach(e => e(data))
                t.once = []
            }
            t.n.forEach(e => e(data))
        }
    }
}
// 一些辅助方法
const api = {
    scrollToTop() {
        document.body.scrollIntoView({
            behavior: 'smooth', // 平滑滚动，爽，其他还有 instant
            block: 'start'
        });
    }, getTop() {
        return document.documentElement.scrollTop || document.body.scrollTop
    }

}

// 用户输入集中处理，禁制在其它部分进行事件监听等，避免过多的监听器导致的无法回收
const uistore = new EventStore()
window.onload = () => {
    uistore.emit('load', { top: api.getTop() })
}
window.onscroll = () => uistore.emit('scroll', api.getTop())
window.onresize = e => uistore.emit('resize', e)
window.onorientationchange = e => uistore.emit('resize', { angle: screen.orientation.angle })
