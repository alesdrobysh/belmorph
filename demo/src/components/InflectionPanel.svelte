<script lang="ts">
  import type { ParseResult } from 'belmorph';
  import type { GrammemeInput, Case, Num, Gender, Tense, Person, Comparison, Voice } from 'belmorph';
  import { appState } from '../lib/lang.svelte.js';
  import { LABELS, UI } from '../lib/i18n.js';
  import { cap } from '../lib/utils.js';

  const i18n = $derived(LABELS[appState.lang]);
  const ui = $derived(UI[appState.lang]);

  let { result }: { result: ParseResult } = $props();

  const pos = $derived(result.tags.pos);

  let selCase = $state<Case | ''>('');
  let selNumber = $state<Num | ''>('');
  let selGender = $state<Gender | ''>('');
  let selTense = $state<Tense | ''>('');
  let selPerson = $state<Person | ''>('');
  let selComparison = $state<Comparison | ''>('');
  let selVoice = $state<Voice | ''>('');

  $effect(() => {
    result;
    selCase = '';
    selNumber = '';
    selGender = '';
    selTense = '';
    selPerson = '';
    selComparison = '';
    selVoice = '';
  });

  function toggle<T extends string>(cur: T | '', val: T): T | '' {
    return cur === val ? '' : val;
  }

  const inflected = $derived.by(() => {
    const target: GrammemeInput = {};
    if (pos === 'N' || pos === 'S' || pos === 'M') {
      if (selCase) target.case = selCase;
      if (selNumber) target.number = selNumber;
    } else if (pos === 'A') {
      if (selCase) target.case = selCase;
      if (selNumber) target.number = selNumber;
      if (selGender) target.gender = selGender;
    } else if (pos === 'V') {
      if (selTense) target.tense = selTense;
      if (selTense === 'R' || selTense === 'F') {
        if (selPerson) target.person = selPerson;
        if (selNumber) target.number = selNumber;
      } else if (selTense === 'P') {
        if (selGender) target.gender = selGender;
        if (selNumber) target.number = selNumber;
      }
    } else if (pos === 'R') {
      if (selComparison) target.comparison = selComparison;
    } else if (pos === 'P') {
      if (selVoice) target.voice = selVoice;
      if (selCase) target.case = selCase;
      if (selNumber) target.number = selNumber;
      if (selGender) target.gender = selGender;
    }
    if (Object.keys(target).length === 0) return null;
    return result.inflect(target);
  });

  // Breadcrumb from the inflected form's tags
  function breadcrumb(tags: ParseResult['tags']): string {
    const parts: string[] = [];
    if (tags.pos)        parts.push(cap(i18n.POS[tags.pos] ?? tags.pos));
    if (tags.tense)      parts.push(i18n.TENSE[tags.tense] ?? tags.tense);
    if (tags.mood)       parts.push(cap(i18n.MOOD[tags.mood] ?? tags.mood));
    if (tags.person)     parts.push(i18n.PERSON[tags.person] ?? tags.person);
    if (tags.case)       parts.push(i18n.CASE[tags.case] ?? tags.case);
    if (tags.gender)     parts.push(i18n.GENDER[tags.gender] ?? tags.gender);
    if (tags.number)     parts.push(i18n.NUMBER[tags.number] ?? tags.number);
    if (tags.animacy)    parts.push(i18n.ANIMACY[tags.animacy] ?? tags.animacy);
    if (tags.aspect)     parts.push(cap(i18n.ASPECT[tags.aspect] ?? tags.aspect));
    if (tags.voice)      parts.push(cap(i18n.VOICE[tags.voice] ?? tags.voice));
    if (tags.comparison) parts.push(i18n.COMPARISON[tags.comparison] ?? tags.comparison);
    return parts.join(' · ');
  }

  const CASES   = ['N','G','D','A','I','L','V'] as const;
  const NUMBERS = ['S','P'] as const;
  const GENDERS = ['M','F','N'] as const;
  const TENSES  = ['R','P','F'] as const;
  const PERSONS = ['1','2','3'] as const;
  const COMPARISONS = ['P','C','S'] as const;
  const VOICES  = ['A','P'] as const;

  const showInflect = $derived(
    pos === 'N' || pos === 'S' || pos === 'M' || pos === 'A' || pos === 'V' || pos === 'R' || pos === 'P'
  );
</script>

{#if showInflect}
  <div class="inflect-box">
    <div class="inflect-box-title">
      <i class="inflect-box-icon">⇄</i>
      {ui.inflection}
    </div>

    {#if pos === 'N' || pos === 'S' || pos === 'M'}
      <div class="radio-group">
        {#each CASES as code}
          <button class="radio-btn" class:active={selCase === code}
            onclick={() => selCase = toggle(selCase, code)}>
            {i18n.CASE_ABBR[code] ?? code}
          </button>
        {/each}
        {#each NUMBERS as code}
          <button class="radio-btn" class:active={selNumber === code}
            onclick={() => selNumber = toggle(selNumber, code)}>
            {i18n.NUMBER_ABBR[code] ?? code}
          </button>
        {/each}
      </div>

    {:else if pos === 'A'}
      <div class="radio-group">
        {#each CASES as code}
          <button class="radio-btn" class:active={selCase === code}
            onclick={() => selCase = toggle(selCase, code)}>
            {i18n.CASE_ABBR[code] ?? code}
          </button>
        {/each}
      </div>
      <div class="radio-group">
        {#each NUMBERS as code}
          <button class="radio-btn" class:active={selNumber === code}
            onclick={() => selNumber = toggle(selNumber, code)}>
            {i18n.NUMBER_ABBR[code] ?? code}
          </button>
        {/each}
        {#each GENDERS as code}
          <button class="radio-btn" class:active={selGender === code}
            onclick={() => selGender = toggle(selGender, code)}>
            {i18n.GENDER_ABBR[code] ?? code}
          </button>
        {/each}
      </div>

    {:else if pos === 'P'}
      <div class="radio-group">
        {#each VOICES as code}
          <button class="radio-btn" class:active={selVoice === code}
            onclick={() => selVoice = toggle(selVoice, code)}>
            {i18n.VOICE_ABBR[code] ?? code}
          </button>
        {/each}
      </div>
      <div class="radio-group">
        {#each CASES as code}
          <button class="radio-btn" class:active={selCase === code}
            onclick={() => selCase = toggle(selCase, code)}>
            {i18n.CASE_ABBR[code] ?? code}
          </button>
        {/each}
      </div>
      <div class="radio-group">
        {#each NUMBERS as code}
          <button class="radio-btn" class:active={selNumber === code}
            onclick={() => selNumber = toggle(selNumber, code)}>
            {i18n.NUMBER_ABBR[code] ?? code}
          </button>
        {/each}
        {#each GENDERS as code}
          <button class="radio-btn" class:active={selGender === code}
            onclick={() => selGender = toggle(selGender, code)}>
            {i18n.GENDER_ABBR[code] ?? code}
          </button>
        {/each}
      </div>

    {:else if pos === 'V'}
      <div class="radio-group">
        {#each TENSES as code}
          <button class="radio-btn" class:active={selTense === code}
            onclick={() => selTense = toggle(selTense, code)}>
            {i18n.TENSE_ABBR[code] ?? code}
          </button>
        {/each}
      </div>
      {#if selTense === 'R' || selTense === 'F'}
        <div class="radio-group">
          {#each PERSONS as code}
            <button class="radio-btn" class:active={selPerson === code}
              onclick={() => selPerson = toggle(selPerson, code)}>
              {i18n.PERSON_ABBR[code] ?? code}
            </button>
          {/each}
          {#each NUMBERS as code}
            <button class="radio-btn" class:active={selNumber === code}
              onclick={() => selNumber = toggle(selNumber, code)}>
              {i18n.NUMBER_ABBR[code] ?? code}
            </button>
          {/each}
        </div>
      {:else if selTense === 'P'}
        <div class="radio-group">
          {#each GENDERS as code}
            <button class="radio-btn" class:active={selGender === code}
              onclick={() => selGender = toggle(selGender, code)}>
              {i18n.GENDER_ABBR[code] ?? code}
            </button>
          {/each}
          {#each NUMBERS as code}
            <button class="radio-btn" class:active={selNumber === code}
              onclick={() => selNumber = toggle(selNumber, code)}>
              {i18n.NUMBER_ABBR[code] ?? code}
            </button>
          {/each}
        </div>
      {/if}

    {:else if pos === 'R'}
      <div class="radio-group">
        {#each COMPARISONS as code}
          <button class="radio-btn" class:active={selComparison === code}
            onclick={() => selComparison = toggle(selComparison, code)}>
            {i18n.COMPARISON_ABBR[code] ?? code}
          </button>
        {/each}
      </div>
    {/if}

    {#if inflected !== null}
      {#if inflected}
        <div class="inflect-word-result">
          <span class="inflect-result-word">{inflected.word}</span>
          <span class="inflect-result-breadcrumb">{breadcrumb(inflected.tags)}</span>
        </div>
      {:else}
        <div class="inflect-impossible">{ui.impossible}</div>
      {/if}
    {/if}
  </div>
{/if}
