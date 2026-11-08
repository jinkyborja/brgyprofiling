<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Dashboard | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div>
    <h1>Dashboard</h1>
    <p>Current records from the barangay database.</p>
  </div>
</div>

{#if data.counts}
  <section class="card-grid" aria-label="Record totals">
    <article class="app-card"><h2>Active residents</h2><strong class="stat-value">{data.counts.residents}</strong></article>
    <article class="app-card"><h2>Households</h2><strong class="stat-value">{data.counts.households}</strong></article>
    <article class="app-card"><h2>Active officials</h2><strong class="stat-value">{data.counts.officials}</strong></article>
    <article class="app-card"><h2>Open requests</h2><strong class="stat-value">{data.counts.requests}</strong></article>
    {#if data.counts.pending_accounts > 0}
      <article class="app-card"><h2>Pending account reviews</h2><strong class="stat-value">{data.counts.pending_accounts}</strong></article>
    {/if}
  </section>
{:else}
  <p class="notice error" role="alert">Dashboard totals are unavailable because the database did not return the expected records.</p>
{/if}
