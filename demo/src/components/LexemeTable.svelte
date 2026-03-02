<script lang="ts">
  import type { ParseResult } from 'belmorph';
  import { CASE, GENDER, PERSON, NUMBER, COMPARISON } from '../lib/i18n.js';

  let { result }: { result: ParseResult } = $props();

  let open = $state(false);

  const pos = $derived(result.tags.pos);
  const lexeme = $derived(result.lexeme);
  const currentWord = $derived(result.word);

  function isCurrent(form: ParseResult) {
    return form.word === currentWord;
  }

  // Noun: organize by case × number
  const CASES = ['N', 'G', 'D', 'A', 'I', 'L', 'V'] as const;
  const NUMBERS = ['S', 'P'] as const;

  function nounTable(forms: ParseResult[]) {
    return CASES.map(c => ({
      caseLabel: CASE[c] ?? c,
      singular: forms.find(f => f.tags.case === c && f.tags.number === 'S') ?? null,
      plural: forms.find(f => f.tags.case === c && f.tags.number === 'P') ?? null,
    }));
  }

  // Adjective: organize by case × gender (sg) + plural row
  const GENDERS = ['M', 'F', 'N'] as const;

  function adjTable(forms: ParseResult[]) {
    return CASES.map(c => ({
      caseLabel: CASE[c] ?? c,
      M: forms.find(f => f.tags.case === c && f.tags.number === 'S' && f.tags.gender === 'M') ?? null,
      F: forms.find(f => f.tags.case === c && f.tags.number === 'S' && f.tags.gender === 'F') ?? null,
      N: forms.find(f => f.tags.case === c && f.tags.number === 'S' && f.tags.gender === 'N') ?? null,
      P: forms.find(f => f.tags.case === c && f.tags.number === 'P') ?? null,
    }));
  }

  // Verb: gather infinitive, present/future, past, imperative sections
  function verbSections(forms: ParseResult[]) {
    const infinitive = forms.find(f => !f.tags.tense && !f.tags.mood && !f.tags.person && !f.tags.gender);
    const present = forms.filter(f => f.tags.tense === 'R' && f.tags.mood === 'I');
    const future = forms.filter(f => f.tags.tense === 'F' && f.tags.mood === 'I');
    const past = forms.filter(f => f.tags.tense === 'P' && f.tags.mood === 'I');
    const imperative = forms.filter(f => f.tags.mood === 'M');
    const gerunds = forms.filter(f => {
      const t = f.tags;
      return !t.case && !t.number && !t.gender && !t.person && !t.mood;
    }).filter(f => f !== infinitive);

    return { infinitive, present, future, past, imperative, gerunds };
  }

  // Simple flat form list for other POS
  function flatForms(forms: ParseResult[]) {
    return forms;
  }

  function formText(f: ParseResult | null): string {
    return f ? f.word : '—';
  }
</script>

<div class="collapsible">
  <button class="collapsible-toggle" onclick={() => (open = !open)}>
    <i class="toggle-arrow" class:open>{open ? '▶' : '▶'}</i>
    {open ? 'Схаваць' : 'Паказаць'} усе формы
  </button>

  {#if open}
    <div class="collapsible-content">
      {#if pos === 'N' || pos === 'S' || pos === 'M'}
        {@const rows = nounTable(lexeme)}
        <table class="lexeme-table">
          <thead>
            <tr>
              <th>Склон</th>
              <th>Адз.</th>
              <th>Мн.</th>
            </tr>
          </thead>
          <tbody>
            {#each rows as row}
              <tr class:current-form={
                (row.singular && isCurrent(row.singular)) ||
                (row.plural && isCurrent(row.plural))
              }>
                <td class="case-label">{row.caseLabel}</td>
                <td class:current-form={row.singular && isCurrent(row.singular)}>
                  {#if row.singular}
                    {row.singular.word}
                  {:else}
                    <span class="form-dash">—</span>
                  {/if}
                </td>
                <td class:current-form={row.plural && isCurrent(row.plural)}>
                  {#if row.plural}
                    {row.plural.word}
                  {:else}
                    <span class="form-dash">—</span>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

      {:else if pos === 'A' || pos === 'P'}
        {@const rows = adjTable(lexeme)}
        <table class="lexeme-table">
          <thead>
            <tr>
              <th>Склон</th>
              <th>Мужч.</th>
              <th>Жан.</th>
              <th>Ніяк.</th>
              <th>Мн.</th>
            </tr>
          </thead>
          <tbody>
            {#each rows as row}
              <tr>
                <td class="case-label">{row.caseLabel}</td>
                <td class:current-form={row.M && isCurrent(row.M)}>
                  {row.M ? row.M.word : '—'}
                </td>
                <td class:current-form={row.F && isCurrent(row.F)}>
                  {row.F ? row.F.word : '—'}
                </td>
                <td class:current-form={row.N && isCurrent(row.N)}>
                  {row.N ? row.N.word : '—'}
                </td>
                <td class:current-form={row.P && isCurrent(row.P)}>
                  {row.P ? row.P.word : '—'}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>

      {:else if pos === 'V'}
        {@const secs = verbSections(lexeme)}
        <table class="lexeme-table">
          <tbody>
            {#if secs.infinitive}
              <tr class="section-header">
                <td colspan="3">Інфінітыў</td>
              </tr>
              <tr class:current-form={isCurrent(secs.infinitive)}>
                <td class="case-label">—</td>
                <td colspan="2">{secs.infinitive.word}</td>
              </tr>
            {/if}

            {#if secs.present.length > 0}
              <tr class="section-header">
                <td colspan="3">Цяперашні час</td>
              </tr>
              {#each ['1', '2', '3'] as person}
                <tr>
                  <td class="case-label">{PERSON[person] ?? person} асоба</td>
                  {#each NUMBERS as num}
                    {@const f = secs.present.find(x => x.tags.person === person && x.tags.number === num)}
                    <td class:current-form={f && isCurrent(f)}>
                      {f ? f.word : '—'}
                    </td>
                  {/each}
                </tr>
              {/each}
            {/if}

            {#if secs.future.length > 0}
              <tr class="section-header">
                <td colspan="3">Будучы час</td>
              </tr>
              {#each ['1', '2', '3'] as person}
                <tr>
                  <td class="case-label">{PERSON[person] ?? person} асоба</td>
                  {#each NUMBERS as num}
                    {@const f = secs.future.find(x => x.tags.person === person && x.tags.number === num)}
                    <td class:current-form={f && isCurrent(f)}>
                      {f ? f.word : '—'}
                    </td>
                  {/each}
                </tr>
              {/each}
            {/if}

            {#if secs.past.length > 0}
              <tr class="section-header">
                <td colspan="3">Прошлы час</td>
              </tr>
              {#each GENDERS as gender}
                {@const f = secs.past.find(x => x.tags.gender === gender && x.tags.number === 'S')}
                <tr>
                  <td class="case-label">{GENDER[gender] ?? gender}</td>
                  <td class:current-form={f && isCurrent(f)} colspan="2">{f ? f.word : '—'}</td>
                </tr>
              {/each}
              {@const fpl = secs.past.find(x => x.tags.number === 'P')}
              <tr>
                <td class="case-label">мн.</td>
                <td class:current-form={fpl && isCurrent(fpl)} colspan="2">{fpl ? fpl.word : '—'}</td>
              </tr>
            {/if}

            {#if secs.imperative.length > 0}
              <tr class="section-header">
                <td colspan="3">Загадны лад</td>
              </tr>
              {#each secs.imperative as f}
                <tr class:current-form={isCurrent(f)}>
                  <td class="case-label">{PERSON[f.tags.person ?? ''] ?? ''} {NUMBER[f.tags.number ?? ''] ?? ''}</td>
                  <td colspan="2">{f.word}</td>
                </tr>
              {/each}
            {/if}

            {#if secs.gerunds.length > 0}
              <tr class="section-header">
                <td colspan="3">Дзеепрыслоўі</td>
              </tr>
              {#each secs.gerunds as f}
                <tr class:current-form={isCurrent(f)}>
                  <td class="case-label">—</td>
                  <td colspan="2">{f.word}</td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>

      {:else if pos === 'R'}
        {@const compIdx = lexeme.findIndex(f => f.tags.comparison === 'C')}
        <table class="lexeme-table">
          <tbody>
            {#each lexeme as f, i}
              {@const label = f.tags.comparison
                ? (COMPARISON[f.tags.comparison] ?? f.tags.comparison)
                : compIdx === -1 ? COMPARISON['P']
                : i < compIdx ? COMPARISON['P']
                : COMPARISON['S']}
              <tr class:current-form={isCurrent(f)}>
                <td class="case-label">{label}</td>
                <td>{f.word}</td>
              </tr>
            {/each}
          </tbody>
        </table>

      {:else}
        <table class="lexeme-table">
          <tbody>
            {#each lexeme as f}
              <tr class:current-form={isCurrent(f)}>
                <td>{f.word}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}
    </div>
  {/if}
</div>
