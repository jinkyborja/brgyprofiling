<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing = $state<PageData['households'][number] | null>(null);
</script>

<svelte:head><title>Households | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div><h1>Households</h1><p>Household records, active members, and household heads.</p></div>
  <button class="app-button" type="button" onclick={() => (editing = null)}>Add household</button>
</div>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

<section class="app-card">
  <h2>{editing ? `Edit ${editing.household_code}` : 'Household record'}</h2>
  <form method="POST" action="?/save" use:enhance class="app-form">
    {#if editing}<input type="hidden" name="household_id" value={editing.household_id} />{/if}
    <div class="field-row">
      <label>Household name<input name="household_name" maxlength="160" value={editing?.household_name ?? ''} /></label>
      <label>Purok<input name="purok" maxlength="80" value={editing?.purok ?? ''} /></label>
    </div>
    <label>Address<input name="address_line" maxlength="255" value={editing?.address_line ?? ''} required /></label>
    <label>Head of household
      <select name="head_resident_id" value={editing?.head_resident_id ?? ''}>
        <option value="">No head selected</option>
        {#each data.residents as resident}
          <option value={resident.resident_id}>{resident.full_name}</option>
        {/each}
      </select>
    </label>
    <div class="inline-form">
      <button class="app-button" type="submit">Save household</button>
      {#if editing}<button class="app-button secondary" type="button" onclick={() => (editing = null)}>Cancel edit</button>{/if}
    </div>
  </form>
</section>

<section class="app-card">
  <h2>Household register ({data.households.length})</h2>
  <div class="app-table-wrap">
    <table class="app-table">
      <thead><tr><th>Code</th><th>Name</th><th>Address</th><th>Head</th><th>Members</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>
        {#each data.households as household}
          <tr>
            <td>{household.household_code}</td><td>{household.household_name ?? '—'}</td>
            <td>{household.address_line}{household.purok ? `, ${household.purok}` : ''}</td>
            <td>{household.head_name ?? '—'}</td><td>{household.member_count}</td>
            <td>{household.archived_at ? 'Archived' : 'Active'}</td>
            <td>
              {#if !household.archived_at}
                <div class="inline-form">
                  <button class="app-button secondary" type="button" onclick={() => (editing = household)}>Edit</button>
                  <form method="POST" action="?/archive" use:enhance>
                    <input type="hidden" name="household_id" value={household.household_id} />
                    <button class="app-button danger" type="submit">Archive</button>
                  </form>
                </div>
              {/if}
            </td>
          </tr>
        {:else}
          <tr><td colspan="7" class="text-muted">No household records are available.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
