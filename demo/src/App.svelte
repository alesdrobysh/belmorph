<script lang="ts">
    import { onMount } from "svelte";
    import { version } from "../../package.json";
    import { MorphAnalyzer } from "belmorph";
    import type { ParseResult } from "belmorph";
    import SearchInput from "./components/SearchInput.svelte";
    import ResultsView from "./components/ResultsView.svelte";

    const EXAMPLES = [
        "кніга",
        "чалавек",
        "горад",
        "вучань",
        "чытаць",
        "ісці",
        "пісаць",
        "добры",
        "беларускі",
        "хутка",
    ];

    let analyzer = $state<MorphAnalyzer | null>(null);
    let loading = $state(true);
    let error = $state("");
    let results = $state<ParseResult[]>([]);
    let searched = $state(false);
    let searchWord = $state("");

    onMount(async () => {
        try {
            analyzer = await MorphAnalyzer.init(
                import.meta.env.BASE_URL + "dict/",
            );
        } catch (e) {
            console.error("Dict load error:", e);
            error = String(e);
        } finally {
            loading = false;
        }
    });

    function onSearch(word: string) {
        if (!word.trim()) {
            results = [];
            searched = false;
            return;
        }
        results = analyzer ? analyzer.parse(word.trim()) : [];
        searched = true;
    }

    function selectExample(word: string) {
        searchWord = word;
        onSearch(word);
    }

    function highlight(code: string): string {
        const esc = code
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
        return esc.replace(
            /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`[^`]*`)|(\b(?:import|export|from|const|let|var|await|async|return|new|function|if)\b)/g,
            (m, comment, str, kw) => {
                if (comment) return `<span class="hl-c">${m}</span>`;
                if (str) return `<span class="hl-s">${m}</span>`;
                if (kw) return `<span class="hl-k">${m}</span>`;
                return m;
            },
        );
    }

    const snippets = [
        {
            title: "Разбор слова",
            code: `import { MorphAnalyzer } from 'belmorph';

const morph = await MorphAnalyzer.init('/dict/');
const [result] = morph.parse('горад');

console.log(result.lemma);         // 'горад'
console.log(result.tags.pos);      // 'N'  (назоўнік)
console.log(result.tags.animacy);  // 'I'  (неадушаўлёны)`,
        },
        {
            title: "Скланенне",
            code: `const city = morph.parse('горад')[0];

city.inflect({ case: 'instrumental', number: 'plural' })?.word;
// → 'гарадамі'

city.inflect({ case: 'G' })?.word;
// → 'горада'`,
        },
        {
            title: "Поўная лексема",
            code: `const forms = morph.parse('чытаць')[0].lexeme;

forms.map(f => f.word);
// → ['чытаць', 'чытаю', 'чытаеш', 'чытае', ...]`,
        },
        {
            title: "Рэальныя прыклады",
            code: `// e-commerce: падлік тавараў
function pluralize(n: number, word: string): string {
    const [p] = morph.parse(word);
    const t = n % 10, h = n % 100;
    if (t === 1 && h !== 11)
        return p.inflect({ case: 'nominative' })?.word ?? word;
    if (t >= 2 && t <= 4 && (h < 12 || h > 14))
        return p.inflect({ case: 'nominative', number: 'plural' })?.word ?? word;
    return p.inflect({ case: 'genitive', number: 'plural' })?.word ?? word;
}
[1, 2, 5, 21, 11].map(n => \`\${n} \${pluralize(n, 'тавар')}\`);
// → ['1 тавар', '2 тавары', '5 тавараў', '21 тавар', '11 тавараў']

\`У кошыку 5 \${pluralize(5, 'тавар')}\`;          // → 'У кошыку 5 тавараў'

// e-commerce: дастаўка ў горад
const city = morph.parse('бярозаўка')[0];
const acc = city.inflect({ case: 'accusative' })?.word;
\`Дастаўка ў \${acc}\`;           // → 'Дастаўка ў бярозаўку'

// чат-бот: прывітанне па імені
const name = morph.parse('міхась')[0];
const nameAcc = name.inflect({ case: 'accusative' })?.word;
\`Націсніце 👋 каб прывітаць \${nameAcc}\`;
// → 'Націсніце 👋 каб прывітаць міхася'

// пошук: нармалізацыя запыту да лемы
function normalize(word: string): string {
    return morph.parse(word)[0]?.lemma ?? word;
}
'кнігі тавары гарады'.split(' ').map(normalize);
// → ['кніга', 'тавар', 'горад']`,
        },
    ];

    let snippetCopied = $state(snippets.map(() => false));
    let npmCopied = $state(false);

    async function copySnippet(i: number) {
        await navigator.clipboard.writeText(snippets[i].code);
        snippetCopied = snippetCopied.map((v, idx) => (idx === i ? true : v));
        setTimeout(() => {
            snippetCopied = snippetCopied.map((v, idx) =>
                idx === i ? false : v,
            );
        }, 1500);
    }

    async function copyNpm() {
        await navigator.clipboard.writeText("npm install belmorph");
        npmCopied = true;
        setTimeout(() => {
            npmCopied = false;
        }, 1500);
    }
</script>

<header class="hero">
    <div class="hero-top">
        <span class="hero-logotype">belmorph</span>
        <span class="hero-version">v{version}</span>
    </div>
    <p class="hero-tagline">
        Беларускі марфалагічны аналізатар для TypeScript.
    </p>
    <div class="hero-features">
        <span class="feature-pill">⚡ DAWG-пошук</span>
        <span class="feature-pill">🌐 Браўзер + Node.js</span>
        <span class="feature-pill">📦 Zero dependencies</span>
    </div>
    <div class="hero-cta">
        <button class="cta-npm" onclick={copyNpm} title="Скапіяваць каманду">
            <code>npm install belmorph</code>
            <span class="cta-icon">{npmCopied ? "✓" : "⧉"}</span>
        </button>
        <a
            class="cta-github"
            href="https://github.com/alesdrobysh/belmorph"
            target="_blank"
            rel="noopener noreferrer">★ GitHub</a
        >
    </div>
</header>

<section id="playground" class="page-section">
    <h2 class="section-heading">Паспрабуй</h2>
    {#if loading}
        <div class="loading">
            <div class="spinner"></div>
            <span>Загрузка слоўніка…</span>
        </div>
    {:else if error}
        <div class="error-message">{error}</div>
    {:else}
        <SearchInput {onSearch} bind:value={searchWord} />

        <div class="examples">
            <span class="examples-label">Прыклады:</span>
            {#each EXAMPLES as word}
                <button
                    class="example-chip"
                    onclick={() => selectExample(word)}
                >
                    {word}
                </button>
            {/each}
        </div>

        <ResultsView {results} {searched} />
    {/if}
</section>

<section id="examples" class="page-section">
    <h2 class="section-heading">Прыклады кода</h2>
    <div class="code-blocks">
        {#each snippets as snippet, i}
            <div class="code-block">
                <div class="code-block-header">
                    <span class="code-block-title">{snippet.title}</span>
                    <button class="copy-btn" onclick={() => copySnippet(i)}>
                        {snippetCopied[i] ? "✓" : "Скапіяваць"}
                    </button>
                </div>
                <pre><code>{@html highlight(snippet.code)}</code></pre>
            </div>
        {/each}
    </div>
</section>

<section id="about" class="page-section">
    <div class="about-grid">
        <div class="about-col">
            <h3 class="about-heading">Чаму belmorph?</h3>
            <p class="about-text">
                Беларуская мова — малавыкарыстальны рэсурс у экасістэме JS/TS.
                belmorph запаўняе гэты прабел, даючы распрацоўнікам поўны
                марфалагічны аналіз для чат-ботаў, пошуку, аўтакарэкцыі і
                NLP-канвеераў.
            </p>
        </div>
        <div class="about-col">
            <h3 class="about-heading">Атрыбуцыя</h3>
            <ul class="about-list">
                <li>
                    Слоўнікавая база:
                    <a
                        href="https://github.com/Belarus/GrammarDB"
                        target="_blank"
                        rel="noopener">GrammarDB</a
                    >
                    (CC-BY-SA 4.0)
                </li>
                <li>Код: MIT</li>
                <li>Нулявыя залежнасці</li>
            </ul>
        </div>
    </div>
</section>

<footer class="site-footer">
    <div class="footer-links">
        <a
            href="https://github.com/alesdrobysh/belmorph"
            target="_blank"
            rel="noopener">★ GitHub</a
        >
        <span class="footer-sep">·</span>
        <a
            href="https://github.com/alesdrobysh/belmorph/issues"
            target="_blank"
            rel="noopener">Issues</a
        >
        <span class="footer-sep">·</span>
        <span>ліцэнзія MIT AND CC-BY-SA-4.0</span>
    </div>
    <p class="footer-credit">
        Зроблена з ♥ для беларускай мовы — <a
            href="https://github.com/alesdrobysh"
            target="_blank"
            rel="noopener">Ales Drobysh</a
        >
    </p>
</footer>
