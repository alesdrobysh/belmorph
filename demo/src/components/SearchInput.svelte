<script lang="ts">
  import { onMount } from 'svelte';

  let { onSearch, value = $bindable('') }: { onSearch: (word: string) => void; value?: string } = $props();

  let timer: ReturnType<typeof setTimeout> | null = null;
  let inputEl: HTMLInputElement | undefined = $state();

  onMount(() => {
    inputEl?.focus();
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
    placeholder="Увядзіце слова…"
    bind:value
    oninput={handleInput}
  />
</div>
