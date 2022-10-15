import parseMarkdown from '../utils/parser'
import { addSpace } from '../utils/parser'

test('addSpace', () => {
    expect(addSpace('')).toBe('')
    expect(addSpace('a')).toBe('a')
    expect(addSpace('#abc')).toBe('#abc')
    expect(addSpace('ab中文c')).toBe('ab 中文 c')
    expect(addSpace('ab中文c中文')).toBe('ab 中文 c 中文')
    expect(addSpace('123あいうえおab中文c')).toBe('123 あいうえお ab 中文 c')
    expect(addSpace('$123%中文ab中文c')).toBe('$123%中文 ab 中文 c')
})

test('parseMarkdown', () => {
    expect(parseMarkdown('')).toBe('')
    expect(parseMarkdown('*abc*')).toBe('<em>abc</em>')
    expect(parseMarkdown('**abc**')).toBe('<strong>abc</strong>')
    expect(parseMarkdown('***abc***')).toBe('<strong><em>abc</em></strong>')
    expect(parseMarkdown('`abc`')).toBe('<code>abc</code>')
    expect(parseMarkdown('```abc```')).toBe('<pre>abc</pre>')
    expect(parseMarkdown('```abc\ndef```')).toBe('<pre>abc\ndef</pre>')
    expect(parseMarkdown('- abc\n- def')).toBe(
        '<span class="list">&bull; abc</span>\n<span class="list">&bull; def</span>'
    )
    expect(parseMarkdown('[abc](https://example.com)')).toBe(
        '<a href="https://example.com">abc</a>'
    )
    expect(parseMarkdown('[abc](nothttp://example.com)')).toBe(
        '[abc](nothttp://example.com)'
    )
    expect(parseMarkdown('[abc](http:/example.com)')).toBe(
        '[abc](http:/example.com)'
    )
})
