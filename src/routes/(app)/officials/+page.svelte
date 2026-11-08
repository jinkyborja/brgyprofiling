<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing = $state<PageData['officials'][number] | null>(null);
</script>

<svelte:head><title>Barangay officials | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div><h1>Barangay officials</h1><p>Official positions and term information.</p></div>
  {#if data.canManage}<button class="app-button" type="button" onclick={() => (editing = null)}>Add official</button>{/if}
</div>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

{#if data.canManage}
  <section class="app-card">
    <h2>{editing ? 'Edit official' : 'Official record'}</h2>
    <form method="POST" action="?/save" use:enhance class="app-form">
      {#if editing}<input type="hidden" name="official_id" value={editing.official_id} />{/if}
      <div class="field-row">
        <label>First name<input name="first_name" maxlength="100" value={editing?.first_name ?? ''} required /></label>
        <label>Middle name<input name="middle_name" maxlength="100" value={editing?.middle_name ?? ''} /></label>
      </div>
      <div class="field-row">
        <label>Last name<input name="last_name" maxlength="100" value={editing?.last_name ?? ''} required /></label>
        <label>Suffix<input name="suffix" maxlength="20" value={editing?.suffix ?? ''} /></label>
      </div>
      <label>Position<input name="position_title" maxlength="120" value={editing?.position_title ?? ''} required /></label>
      <div class="field-row">
        <label>Term start<input type="date" name="term_start" value={editing?.term_start?.slice(0, 10) ?? ''} /></label>
        <label>Term end<input type="date" name="term_end" value={editing?.term_end?.slice(0, 10) ?? ''} /></label>
      </div>
      <label>Contact number<input name="contact_number" maxlength="32" value={editing?.contact_number ?? ''} /></label>
      <label>Email address<input type="email" name="email" maxlength="254" value={editing?.email ?? ''} /></label>
      <div class="inline-form">
        <button class="app-button" type="submit">Save official</button>
        {#if editing}<button class="app-button secondary" type="button" onclick={() => (editing = null)}>Cancel edit</button>{/if}
      </div>
    </form>
  </section>
{/if}

<section class="app-card">
  <h2>Official roster ({data.officials.length})</h2>
  <div class="app-table-wrap">
    <table class="app-table">
      <thead><tr><th>Name</th><th>Position</th><th>Term</th><th>Contact</th><th>Status</th>{#if data.canManage}<th>Actions</th>{/if}</tr></thead>
      <tbody>
        {#each data.officials as official}
          <tr>
            <td>{official.first_name} {official.middle_name ?? ''} {official.last_name} {official.suffix ?? ''}</td>
            <td>{official.position_title}</td>
            <td>{official.term_start?.slice(0, 10) ?? '—'} – {official.term_end?.slice(0, 10) ?? '—'}</td>
            <td>{official.contact_number ?? '—'}{official.email ? ` · ${official.email}` : ''}</td>
            <td>{official.is_active ? 'Active' : 'Inactive'}</td>
            {#if data.canManage}
              <td>
                <div class="inline-form">
                  <button class="app-button secondary" type="button" onclick={() => (editing = official)}>Edit</button>
                  {#if official.is_active}
                    <form method="POST" action="?/deactivate" use:enhance>
                      <input type="hidden" name="official_id" value={official.official_id} />
                      <button class="app-button danger" type="submit">Mark inactive</button>
                    </form>
                  {/if}
                </div>
              </td>
            {/if}
          </tr>
        {:else}
          <tr><td colspan={data.canManage ? 6 : 5} class="text-muted">No official records are available.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
