<script lang="ts">
  import type { ParseResult } from 'belmorph';
  import { appState } from '../lib/lang.svelte.js';
  import { LABELS, UI } from '../lib/i18n.js';

  const i18n = $derived(LABELS[appState.lang]);
  const ui = $derived(UI[appState.lang]);

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

  // Adjective: organize by case × gender (sg) + plural row
  const GENDERS = ['M', 'F', 'N'] as const;

  const nounRows = $derived(
    CASES.map(c => ({
      caseLabel: i18n.CASE[c] ?? c,
      singular: lexeme.find(f => f.tags.case === c && f.tags.number === 'S') ?? null,
      plural: lexeme.find(f => f.tags.case === c && f.tags.number === 'P') ?? null,
    }))
  );

  const adjRows = $derived(
    CASES.map(c => ({
      caseLabel: i18n.CASE[c] ?? c,
      M: lexeme.find(f => f.tags.case === c && f.tags.number === 'S' && f.tags.gender === 'M') ?? null,
      F: lexeme.find(f => f.tags.case === c && f.tags.number === 'S' && f.tags.gender === 'F') ?? null,
      N: lexeme.find(f => f.tags.case === c && f.tags.number === 'S' && f.tags.gender === 'N') ?? null,
      P: lexeme.find(f => f.tags.case === c && f.tags.number === 'P') ?? null,
    }))
  );

  // Verb: gather infinitive, present/future, past, imperative sections
  const verbSecs = $derived.by(() => {
    const forms = lexeme;
    const infinitive = forms.find(f => !f.tags.tense && !f.tags.mood && !f.tags.person && !f.tags.gender);
    const present = forms.filter(f => f.tags.tense === 'R' && f.tags.mood === 'I');
    const future = forms.filter(f => f.tags.tense === 'F' && f.tags.mood === 'I');
    const past = forms.filter(f => f.tags.tense === 'P' && f.tags.mood === 'I');
    const imperative = forms.filter(f => f.tags.mood === 'M');
    const gerunds = forms.filter(f => {
      const t = f.tags;
      return !t.tense && !t.mood && !t.case && !t.number && !t.gender && !t.person && f !== infinitive;
    });
    return { infinitive, present, future, past, imperative, gerunds };
  });
</script>

<div class="collapsible">
  <button class="collapsible-toggle" onclick={() => (open = !open)}>
    {open ? '∧' : '∨'}
    {open ? ui.hideForms : ui.showForms} ({lexeme.length})
  </button>

  {#if open}
    <div class="collapsible-content">
      {#if pos === 'N' || pos === 'S' || pos === 'M'}
        <table class="lexeme-table">
          <thead>
            <tr>
              <th>{ui.case}</th>
              <th>{ui.singular_abbr}</th>
              <th>{ui.plural_abbr}</th>
            </tr>
          </thead>
          <tbody>
            {#each nounRows as row}
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
        <table class="lexeme-table">
          <thead>
            <tr>
              <th>{ui.case}</th>
              <th>{ui.masc_abbr}</th>
              <th>{ui.fem_abbr}</th>
              <th>{ui.neut_abbr}</th>
              <th>{ui.plural_abbr}</th>
            </tr>
          </thead>
          <tbody>
            {#each adjRows as row}
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
        <table class="lexeme-table">
          <tbody>
            {#if verbSecs.infinitive}
              <tr class="section-header">
                <td colspan="3">{ui.infinitive}</td>
              </tr>
              <tr class:current-form={isCurrent(verbSecs.infinitive)}>
                <td class="case-label">—</td>
                <td colspan="2">{verbSecs.infinitive.word}</td>
              </tr>
            {/if}

            {#if verbSecs.present.length > 0}
              <tr class="section-header">
                <td colspan="3">{ui.presentTense}</td>
              </tr>
              {#each ['1', '2', '3'] as person}
                <tr>
                  <td class="case-label">{i18n.PERSON[person] ?? person}{ui.person_suffix ? ` ${ui.person_suffix}` : ''}</td>
                  {#each NUMBERS as num}
                    {@const f = verbSecs.present.find(x => x.tags.person === person && x.tags.number === num)}
                    <td class:current-form={f && isCurrent(f)}>
                      {f ? f.word : '—'}
                    </td>
                  {/each}
                </tr>
              {/each}
            {/if}

            {#if verbSecs.future.length > 0}
              <tr class="section-header">
                <td colspan="3">{ui.futureTense}</td>
              </tr>
              {#each ['1', '2', '3'] as person}
                <tr>
                  <td class="case-label">{i18n.PERSON[person] ?? person}{ui.person_suffix ? ` ${ui.person_suffix}` : ''}</td>
                  {#each NUMBERS as num}
                    {@const f = verbSecs.future.find(x => x.tags.person === person && x.tags.number === num)}
                    <td class:current-form={f && isCurrent(f)}>
                      {f ? f.word : '—'}
                    </td>
                  {/each}
                </tr>
              {/each}
            {/if}

            {#if verbSecs.past.length > 0}
              <tr class="section-header">
                <td colspan="3">{ui.pastTense}</td>
              </tr>
              {#each GENDERS as gender}
                {@const f = verbSecs.past.find(x => x.tags.gender === gender && x.tags.number === 'S')}
                <tr>
                  <td class="case-label">{i18n.GENDER[gender] ?? gender}</td>
                  <td class:current-form={f && isCurrent(f)} colspan="2">{f ? f.word : '—'}</td>
                </tr>
              {/each}
              {@const fpl = verbSecs.past.find(x => x.tags.number === 'P')}
              <tr>
                <td class="case-label">{ui.plural_abbr2}</td>
                <td class:current-form={fpl && isCurrent(fpl)} colspan="2">{fpl ? fpl.word : '—'}</td>
              </tr>
            {/if}

            {#if verbSecs.imperative.length > 0}
              <tr class="section-header">
                <td colspan="3">{ui.imperative}</td>
              </tr>
              {#each verbSecs.imperative as f}
                <tr class:current-form={isCurrent(f)}>
                  <td class="case-label">{i18n.PERSON[f.tags.person ?? ''] ?? ''} {i18n.NUMBER[f.tags.number ?? ''] ?? ''}</td>
                  <td colspan="2">{f.word}</td>
                </tr>
              {/each}
            {/if}

            {#if verbSecs.gerunds.length > 0}
              <tr class="section-header">
                <td colspan="3">{ui.gerunds}</td>
              </tr>
              {#each verbSecs.gerunds as f}
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
            {#each lexeme as f, idx}
              {@const label = f.tags.comparison
                ? (i18n.COMPARISON[f.tags.comparison] ?? f.tags.comparison)
                : compIdx === -1 ? i18n.COMPARISON['P']
                : idx < compIdx ? i18n.COMPARISON['P']
                : i18n.COMPARISON['S']}
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
