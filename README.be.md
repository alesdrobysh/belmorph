# belmorph

[English](README.md)

**Бібліятэка марфалагічнага аналізу беларускай мовы без залежнасцяў**

Хуткая, лёгкая бібліятэка для аналізу беларускіх слоў і іх марфалагічных уласцівасцяў.

[Дэма](https://alesdrobysh.github.io/belmorph/)

## Магчымасці

- **Марфалагічны аналіз**: Вызначэнне часціны мовы, склону, роду, ліку, часу, трывання, адушаўлёнасці, ступені параўнання і іншых граматычных уласцівасцяў
- **Скланенне**: Генерацыя розных граматычных форм слоў
- **Генерацыя лексемы**: Атрыманне ўсіх магчымых форм слова
- **Марфалагічнае прадказанне**: Невядомыя словы аналізуюцца па суфіксальных узорах
- **Без залежнасцяў**: Ніякіх знешніх залежнасцяў пры выкананні
- **Падтрымка TypeScript**: Поўныя вызначэнні тыпаў
- **Эфектыўнае захоўванне**: Выкарыстоўвае DAWG (Directed Acyclic Word Graph) для хуткага пошуку
- **Сумяшчальнасць з браўзерам**: Працуе ў Node.js, браўзерах і Deno — без native залежнасцяў
- Слоўнік ахоплівае 6 574 парадыгмы скланення, атрыманыя з GrammarDB

## Усталёўка

```bash
npm install belmorph
```

## Хуткі старт

### Node.js — файлавая сістэма (убудаваны слоўнік)

```typescript
import { MorphAnalyzer } from 'belmorph';
import { loadDict } from 'belmorph/node';

const morph = new MorphAnalyzer(loadDict()); // выкарыстоўвае ўбудаваны dict/
const results = morph.parse('горад');

console.log(results[0].lemma);    // 'горад'
console.log(results[0].tags.pos); // 'N' (назоўнік)

// Скланенне да патрэбнай формы
results[0].inflect({ case: 'I', number: 'P' })?.word; // 'гарадамі'

// Поўныя назвы і кароткія коды ўзаемазамяняльныя
results[0].inflect({ case: 'instrumental', number: 'plural' })?.word; // 'гарадамі'

// Атрымаць усе формы
const lexeme = results[0].lexeme;
console.log(lexeme.map(r => r.word));
```

### Браўзер / Deno / Node.js — HTTP

```typescript
import { MorphAnalyzer } from 'belmorph';

// Раздавайце папку dict/ як статычныя файлы і ўкажыце на яе:
const morph = await MorphAnalyzer.init('/dict/');
// або з CDN:
const morph = await MorphAnalyzer.init('https://cdn.example.com/dict/');

const results = morph.parse('горад');
```

Калі слова не знойдзена ў слоўніку, аналізатар выкарыстоўвае прадказанне на аснове суфіксаў. Такія вынікі маюць `predicted: true` і могуць быць менш дакладнымі.

## API

### Загрузка

| Метад | Асяроддзе | Апісанне |
|-------|-----------|----------|
| `new MorphAnalyzer(dict)` | усюды | Канструктар, які прымае гатовы аб'ект `DictData` |
| `MorphAnalyzer.init(baseUrl?)` | усюды | Асінхронная фабрыка — загружае і распакоўвае файлы слоўніка праз HTTP. Базавы URL па змоўчанні: `'/dict/'` |
| `loadDict(dir?)` з `belmorph/node` | толькі Node.js | Сінхронная загрузка з файлавай сістэмы. Па змоўчанні выкарыстоўвае ўбудаваны `dict/` |

### ParseResult

`MorphAnalyzer.parse(word)` вяртае масіў аб'ектаў `ParseResult`. Кожны вынік мае:

- `word` — форма слова
- `lemma` — слоўнікавая форма
- `tags` — граматычныя ўласцівасці (інтэрфейс `Grammeme`, гл. `src/tags.ts`)
- `predicted` — ці быў аналіз прадказаны
- `inflect(target)` — вяртае форму паводле зададзеных граммем або `null`
- `lexeme` — усе формы слова

Значэнні граммем адпавядаюць кодам [GrammarDB](https://github.com/Belarus/GrammarDB). `inflect()` прымае як кароткія коды (`'I'`), так і поўныя англійскія назвы (`'instrumental'`).

## Зборка слоўніка

Бібліятэка патрабуе загадзя зробленага слоўніка. Для яго зборкі:

```bash
git submodule update --init
npm run build:dict
```

Гэта створыць неабходныя файлы слоўніка ў дырэкторыі `dict/`.

## Тэсціраванне

```bash
npm test           # Аднаразовы запуск тэстаў
npm run test:watch # Запуск тэстаў у рэжыме назірання
```

## Ліцэнзія

Гэты праект мае падвойную ліцэнзію:
- **Зыходны код**: [Ліцэнзія MIT](LICENSE)
- **Дадзеныя слоўніка**: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) (атрыманы з GrammarDB)

Гл. файл [LICENSE](LICENSE) каб убачыць поўную інфармацыю.

## Падзякі

- Дадзеныя слоўніка з [GrammarDB](https://github.com/Belarus/GrammarDB) Алеся Булойчыка і ўдзельнікаў.
- Натхнёны [pymorphy2](https://github.com/pymorphy2/pymorphy2) і іншымі марфалагічнымі аналізатарамі.
