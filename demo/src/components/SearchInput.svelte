<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { appState } from '../lib/lang.svelte.js';
  import { UI } from '../lib/i18n.js';

  const ui = $derived(UI[appState.lang]);

  let { onSearch, value = $bindable('') }: { onSearch: (word: string) => void; value?: string } = $props();

  let timer: ReturnType<typeof setTimeout> | null = null;
  let inputEl: HTMLInputElement | undefined = $state();

  onMount(() => {
    inputEl?.focus();
  });

  onDestroy(() => {
    if (timer) clearTimeout(timer);
  });

  function handleInput() {
    if (timer) clearTimeout(timer);
    if (!value.trim()) {
      onSearch('');
      return;
    }
    timer = setTimeout(() => {
      onSearch(value);
    }, 150);
  }
</script>

<div class="search-wrap">
  <input
    bind:this={inputEl}
    class="search-input"
    type="text"
    placeholder={ui.placeholder}
    bind:value
    oninput={handleInput}
  />
</div>
