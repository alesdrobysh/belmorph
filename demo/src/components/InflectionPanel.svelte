<script lang="ts">
  import type { ParseResult } from 'belmorph';
  import type { GrammemeInput, Case, Num, Gender, Tense, Person, Comparison, Voice } from 'belmorph';
  import { CASE, NUMBER, GENDER, TENSE, PERSON, COMPARISON, VOICE } from '../lib/i18n.js';

  let { result }: { result: ParseResult } = $props();

  const pos = $derived(result.tags.pos);

  // Controls state
  let selCase = $state<Case | ''>('');
  let selNumber = $state<Num | ''>('');
  let selGender = $state<Gender | ''>('');
  let selTense = $state<Tense | ''>('');
  let selPerson = $state<Person | ''>('');
  let selComparison = $state<Comparison | ''>('');
  let selVoice = $state<Voice | ''>('');

  // Reset controls when result changes
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

  const cases = Object.entries(CASE) as [Case, string][];
  const numbers = Object.entries(NUMBER) as [Num, string][];
  const genders = Object.entries(GENDER) as [Gender, string][];
  const tenses = Object.entries(TENSE) as [Tense, string][];
  const persons = Object.entries(PERSON) as [Person, string][];
  const comparisons = Object.entries(COMPARISON) as [Comparison, string][];
  const voices = Object.entries(VOICE) as [Voice, string][];

  const showInflect = $derived(
    pos === 'N' || pos === 'S' || pos === 'M' || pos === 'A' || pos === 'V' || pos === 'R' || pos === 'P'
  );
</script>

{#if showInflect}
  <div class="section">
    <div class="section-title">Словазмяненне</div>
    <div class="inflect-controls">
      {#if pos === 'N' || pos === 'S' || pos === 'M' || pos === 'A' || pos === 'P'}
        <div class="inflect-field">
          <label class="inflect-label" for="sel-case">Склон</label>
          <select class="inflect-select" id="sel-case" bind:value={selCase}>
            <option value="">—</option>
            {#each cases as [code, label]}
              <option value={code}>{label}</option>
            {/each}
          </select>
        </div>
        <div class="inflect-field">
          <label class="inflect-label" for="sel-number">Лік</label>
          <select class="inflect-select" id="sel-number" bind:value={selNumber}>
            <option value="">—</option>
            {#each numbers as [code, label]}
              <option value={code}>{label}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if pos === 'A' || pos === 'P'}
        <div class="inflect-field">
          <label class="inflect-label" for="sel-gender">Род</label>
          <select class="inflect-select" id="sel-gender" bind:value={selGender}>
            <option value="">—</option>
            {#each genders as [code, label]}
              <option value={code}>{label}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if pos === 'P'}
        <div class="inflect-field">
          <label class="inflect-label" for="sel-voice">Стан</label>
          <select class="inflect-select" id="sel-voice" bind:value={selVoice}>
            <option value="">—</option>
            {#each voices as [code, label]}
              <option value={code}>{label}</option>
            {/each}
          </select>
        </div>
      {/if}

      {#if pos === 'V'}
        <div class="inflect-field">
          <label class="inflect-label" for="sel-tense">Час</label>
          <select class="inflect-select" id="sel-tense" bind:value={selTense}>
            <option value="">—</option>
            {#each tenses as [code, label]}
              <option value={code}>{label}</option>
            {/each}
          </select>
        </div>
        {#if selTense === 'R' || selTense === 'F'}
          <div class="inflect-field">
            <label class="inflect-label" for="sel-person">Асоба</label>
            <select class="inflect-select" id="sel-person" bind:value={selPerson}>
              <option value="">—</option>
              {#each persons as [code, label]}
                <option value={code}>{label}</option>
              {/each}
            </select>
          </div>
          <div class="inflect-field">
            <label class="inflect-label" for="sel-number-v">Лік</label>
            <select class="inflect-select" id="sel-number-v" bind:value={selNumber}>
              <option value="">—</option>
              {#each numbers as [code, label]}
                <option value={code}>{label}</option>
              {/each}
            </select>
          </div>
        {:else if selTense === 'P'}
          <div class="inflect-field">
            <label class="inflect-label" for="sel-gender-v">Род</label>
            <select class="inflect-select" id="sel-gender-v" bind:value={selGender}>
              <option value="">—</option>
              {#each genders as [code, label]}
                <option value={code}>{label}</option>
              {/each}
            </select>
          </div>
          <div class="inflect-field">
            <label class="inflect-label" for="sel-number-vp">Лік</label>
            <select class="inflect-select" id="sel-number-vp" bind:value={selNumber}>
              <option value="">—</option>
              {#each numbers as [code, label]}
                <option value={code}>{label}</option>
              {/each}
            </select>
          </div>
        {/if}
      {/if}

      {#if pos === 'R'}
        <div class="inflect-field">
          <label class="inflect-label" for="sel-comparison">Ступень параўнання</label>
          <select class="inflect-select" id="sel-comparison" bind:value={selComparison}>
            <option value="">—</option>
            {#each comparisons as [code, label]}
              <option value={code}>{label}</option>
            {/each}
          </select>
        </div>
      {/if}
    </div>

    {#if inflected !== null}
      {#if inflected}
        <div class="inflect-result">{inflected.word}</div>
      {:else}
        <div class="inflect-result empty">немагчымая форма</div>
      {/if}
    {/if}
  </div>
{/if}
