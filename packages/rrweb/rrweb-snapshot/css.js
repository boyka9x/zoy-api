const commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
export function parse(css, options = {}) {
    let lineno = 1;
    let column = 1;
    function updatePosition(str) {
        const lines = str.match(/\n/g);
        if (lines) {
            lineno += lines.length;
        }
        const i = str.lastIndexOf('\n');
        column = i === -1 ? column + str.length : str.length - i;
    }
    function position() {
        const start = { line: lineno, column };
        return (node) => {
            node.position = new Position(start);
            whitespace();
            return node;
        };
    }
    class Position {
        constructor(start) {
            this.start = start;
            this.end = { line: lineno, column };
            this.source = options.source;
        }
    }
    Position.prototype.content = css;
    const errorsList = [];
    function error(msg) {
        const err = new Error(`${options.source || ''}:${lineno}:${column}: ${msg}`);
        err.reason = msg;
        err.filename = options.source;
        err.line = lineno;
        err.column = column;
        err.source = css;
        if (options.silent) {
            errorsList.push(err);
        }
        else {
            throw err;
        }
    }
    function stylesheet() {
        const rulesList = rules();
        return {
            type: 'stylesheet',
            stylesheet: {
                source: options.source,
                rules: rulesList,
                parsingErrors: errorsList,
            },
        };
    }
    function open() {
        return match(/^{\s*/);
    }
    function close() {
        return match(/^}/);
    }
    function rules() {
        let node;
        const rules = [];
        whitespace();
        comments(rules);
        while (css.length && css.charAt(0) !== '}' && (node = atrule() || rule())) {
            if (node) {
                rules.push(node);
                comments(rules);
            }
        }
        return rules;
    }
    function match(re) {
        const m = re.exec(css);
        if (!m) {
            return;
        }
        const str = m[0];
        updatePosition(str);
        css = css.slice(str.length);
        return m;
    }
    function whitespace() {
        match(/^\s*/);
    }
    function comments(rules = []) {
        let c;
        while ((c = comment())) {
            if (c) {
                rules.push(c);
            }
            c = comment();
        }
        return rules;
    }
    function comment() {
        const pos = position();
        if ('/' !== css.charAt(0) || '*' !== css.charAt(1)) {
            return;
        }
        let i = 2;
        while ('' !== css.charAt(i) &&
            ('*' !== css.charAt(i) || '/' !== css.charAt(i + 1))) {
            ++i;
        }
        i += 2;
        if ('' === css.charAt(i - 1)) {
            return error('End of comment missing');
        }
        const str = css.slice(2, i - 2);
        column += 2;
        updatePosition(str);
        css = css.slice(i);
        column += 2;
        return pos({
            type: 'comment',
            comment: str,
        });
    }
    function selector() {
        const m = match(/^([^{]+)/);
        if (!m) {
            return;
        }
        return trim(m[0])
            .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
            .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, (m) => {
            return m.replace(/,/g, '\u200C');
        })
            .split(/\s*(?![^(]*\)),\s*/)
            .map((s) => {
            return s.replace(/\u200C/g, ',');
        });
    }
    function declaration() {
        const pos = position();
        const propMatch = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
        if (!propMatch) {
            return;
        }
        const prop = trim(propMatch[0]);
        if (!match(/^:\s*/)) {
            return error(`property missing ':'`);
        }
        const val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
        const ret = pos({
            type: 'declaration',
            property: prop.replace(commentre, ''),
            value: val ? trim(val[0]).replace(commentre, '') : '',
        });
        match(/^[;\s]*/);
        return ret;
    }
    function declarations() {
        const decls = [];
        if (!open()) {
            return error(`missing '{'`);
        }
        comments(decls);
        let decl;
        while ((decl = declaration())) {
            if (decl !== false) {
                decls.push(decl);
                comments(decls);
            }
            decl = declaration();
        }
        if (!close()) {
            return error(`missing '}'`);
        }
        return decls;
    }
    function keyframe() {
        let m;
        const vals = [];
        const pos = position();
        while ((m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/))) {
            vals.push(m[1]);
            match(/^,\s*/);
        }
        if (!vals.length) {
            return;
        }
        return pos({
            type: 'keyframe',
            values: vals,
            declarations: declarations(),
        });
    }
    function atkeyframes() {
        const pos = position();
        let m = match(/^@([-\w]+)?keyframes\s*/);
        if (!m) {
            return;
        }
        const vendor = m[1];
        m = match(/^([-\w]+)\s*/);
        if (!m) {
            return error('@keyframes missing name');
        }
        const name = m[1];
        if (!open()) {
            return error(`@keyframes missing '{'`);
        }
        let frame;
        let frames = comments();
        while ((frame = keyframe())) {
            frames.push(frame);
            frames = frames.concat(comments());
        }
        if (!close()) {
            return error(`@keyframes missing '}'`);
        }
        return pos({
            type: 'keyframes',
            name,
            vendor,
            keyframes: frames,
        });
    }
    function atsupports() {
        const pos = position();
        const m = match(/^@supports *([^{]+)/);
        if (!m) {
            return;
        }
        const supports = trim(m[1]);
        if (!open()) {
            return error(`@supports missing '{'`);
        }
        const style = comments().concat(rules());
        if (!close()) {
            return error(`@supports missing '}'`);
        }
        return pos({
            type: 'supports',
            supports,
            rules: style,
        });
    }
    function athost() {
        const pos = position();
        const m = match(/^@host\s*/);
        if (!m) {
            return;
        }
        if (!open()) {
            return error(`@host missing '{'`);
        }
        const style = comments().concat(rules());
        if (!close()) {
            return error(`@host missing '}'`);
        }
        return pos({
            type: 'host',
            rules: style,
        });
    }
    function atmedia() {
        const pos = position();
        const m = match(/^@media *([^{]+)/);
        if (!m) {
            return;
        }
        const media = trim(m[1]);
        if (!open()) {
            return error(`@media missing '{'`);
        }
        const style = comments().concat(rules());
        if (!close()) {
            return error(`@media missing '}'`);
        }
        return pos({
            type: 'media',
            media,
            rules: style,
        });
    }
    function atcustommedia() {
        const pos = position();
        const m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
        if (!m) {
            return;
        }
        return pos({
            type: 'custom-media',
            name: trim(m[1]),
            media: trim(m[2]),
        });
    }
    function atpage() {
        const pos = position();
        const m = match(/^@page */);
        if (!m) {
            return;
        }
        const sel = selector() || [];
        if (!open()) {
            return error(`@page missing '{'`);
        }
        let decls = comments();
        let decl;
        while ((decl = declaration())) {
            decls.push(decl);
            decls = decls.concat(comments());
        }
        if (!close()) {
            return error(`@page missing '}'`);
        }
        return pos({
            type: 'page',
            selectors: sel,
            declarations: decls,
        });
    }
    function atdocument() {
        const pos = position();
        const m = match(/^@([-\w]+)?document *([^{]+)/);
        if (!m) {
            return;
        }
        const vendor = trim(m[1]);
        const doc = trim(m[2]);
        if (!open()) {
            return error(`@document missing '{'`);
        }
        const style = comments().concat(rules());
        if (!close()) {
            return error(`@document missing '}'`);
        }
        return pos({
            type: 'document',
            document: doc,
            vendor,
            rules: style,
        });
    }
    function atfontface() {
        const pos = position();
        const m = match(/^@font-face\s*/);
        if (!m) {
            return;
        }
        if (!open()) {
            return error(`@font-face missing '{'`);
        }
        let decls = comments();
        let decl;
        while ((decl = declaration())) {
            decls.push(decl);
            decls = decls.concat(comments());
        }
        if (!close()) {
            return error(`@font-face missing '}'`);
        }
        return pos({
            type: 'font-face',
            declarations: decls,
        });
    }
    const atimport = _compileAtrule('import');
    const atcharset = _compileAtrule('charset');
    const atnamespace = _compileAtrule('namespace');
    function _compileAtrule(name) {
        const re = new RegExp('^@' + name + '\\s*([^;]+);');
        return () => {
            const pos = position();
            const m = match(re);
            if (!m) {
                return;
            }
            const ret = { type: name };
            ret[name] = m[1].trim();
            return pos(ret);
        };
    }
    function atrule() {
        if (css[0] !== '@') {
            return;
        }
        return (atkeyframes() ||
            atmedia() ||
            atcustommedia() ||
            atsupports() ||
            atimport() ||
            atcharset() ||
            atnamespace() ||
            atdocument() ||
            atpage() ||
            athost() ||
            atfontface());
    }
    function rule() {
        const pos = position();
        const sel = selector();
        if (!sel) {
            return error('selector missing');
        }
        comments();
        return pos({
            type: 'rule',
            selectors: sel,
            declarations: declarations(),
        });
    }
    return addParent(stylesheet());
}
function trim(str) {
    return str ? str.replace(/^\s+|\s+$/g, '') : '';
}
function addParent(obj, parent) {
    const isNode = obj && typeof obj.type === 'string';
    const childParent = isNode ? obj : parent;
    for (const k of Object.keys(obj)) {
        const value = obj[k];
        if (Array.isArray(value)) {
            value.forEach((v) => {
                addParent(v, childParent);
            });
        }
        else if (value && typeof value === 'object') {
            addParent(value, childParent);
        }
    }
    if (isNode) {
        Object.defineProperty(obj, 'parent', {
            configurable: true,
            writable: true,
            enumerable: false,
            value: parent || null,
        });
    }
    return obj;
}
