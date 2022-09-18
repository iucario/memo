const rules = [
    {
        regex: /\*\*(.+?)\*\*/g,
        replacement: '<strong>$1</strong>',
    },
    {
        regex: /\*(.*)\*/g,
        replacement: '<em>$1</em>',
    },
    {
        regex: /```(.+?)```/gs,
        replacement: '<pre>$1</pre>',
    },
    {
        regex: /`(.*)`/g,
        replacement: '<code>$1</code>',
    },
    {
        regex: /^[*-] (.+)/gm,
        replacement: '<span class="list">&bull; $1</span>',
    },
    {
        regex: /\[(.*)\]\(((http)(?:s)?(:\/\/).*)\)/g,
        replacement: '<a href="$2">$1</a>',
    },
]
const cjk = /\p{sc=Han}|\p{sc=Katakana}|\p{sc=Hiragana}|\p{sc=Hangul}/gu
const eng = /\p{sc=Latin}|[\d+]/gu
const ascii = /^[\x00-\x7F]*$/g

/** Add space between Latin and CJK */
function addSpace(s: string) {
    const r = s.replace(eng, 'E').replace(cjk, '#')
    let ans = ''
    if (s.length) {
        ans = s[0]
    }
    for (let i = 1; i < r.length; i++) {
        if (r[i] === 'E' && r[i - 1] === '#') {
            ans += ' '
        } else if (r[i] === '#' && r[i - 1] === 'E') {
            ans += ' '
        }
        ans += s[i]
    }
    return ans
}

const parseMarkdown = (text: string) => {
    text = '\n' + addSpace(text) + '\n'
    rules.forEach(function (rule) {
        text = text.replace(rule.regex, rule.replacement)
    })

    return text.trim()
}

export default parseMarkdown
