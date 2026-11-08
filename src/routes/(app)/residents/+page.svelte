<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData, ActionData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing = $state<PageData['residents'][number] | null>(null);
</script>

<svelte:head><title>Residents | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div><h1>Resident records</h1><p>Resident data and verification status.</p></div>
  <button class="app-button" type="button" onclick={() => (editing = null)}>Add resident</button>
</div>

{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

<section class="app-card" aria-label={editing ? 'Edit resident' : 'Add resident'}>
  <h2>{editing ? `Edit ${editing.first_name} ${editing.last_name}` : 'Resident record'}</h2>
  <form method="POST" action="?/save" use:enhance class="app-form">
    {#if editing}<input type="hidden" name="resident_id" value={editing.resident_id} />{/if}
    <div class="field-row">
      <label>First name<input name="first_name" maxlength="100" value={editing?.first_name ?? ''} required /></label>
      <label>Middle name<input name="middle_name" maxlength="100" value={editing?.middle_name ?? ''} /></label>
    </div>
    <div class="field-row">
      <label>Last name<input name="last_name" maxlength="100" value={editing?.last_name ?? ''} required /></label>
      <label>Suffix<input name="suffix" maxlength="20" value={editing?.suffix ?? ''} /></label>
    </div>
    <div class="field-row">
      <label>Birth date<input type="date" name="birth_date" value={editing?.birth_date?.slice(0, 10) ?? ''} /></label>
      <label>Sex<input name="sex" maxlength="32" value={editing?.sex ?? ''} /></label>
    </div>
    <div class="field-row">
      <label>Civil status<input name="civil_status" maxlength="32" value={editing?.civil_status ?? ''} /></label>
      <label>Contact number<input name="contact_number" maxlength="32" value={editing?.contact_number ?? ''} /></label>
    </div>
    <div class="field-row">
      <label>Education<input name="education" maxlength="80" value={editing?.education ?? ''} /></label>
      <label>Disability details<input name="disability" maxlength="120" value={editing?.disability ?? ''} /></label>
    </div>
    <label>Religion<input name="religion" maxlength="120" value={editing?.religion ?? ''} /></label>
    <div class="field-row">
      <label>Household
        <select name="household_id" value={editing?.household_id ?? ''}>
          <option value="">Not assigned to a household</option>
          {#each data.households as household}
            <option value={household.household_id}>
              {household.household_code}{household.household_name ? ` — ${household.household_name}` : ''}
            </option>
          {/each}
        </select>
      </label>
      <label>Relationship to household head
        <input name="relationship_to_head" maxlength="40" value={editing?.relationship_to_head ?? ''} />
      </label>
    </div>
    <div class="inline-form">
      <button class="app-button" type="submit">Save resident</button>
      {#if editing}<button class="app-button secondary" type="button" onclick={() => (editing = null)}>Cancel edit</button>{/if}
    </div>
  </form>
</section>

<section class="app-card" aria-label="Resident directory">
  <h2>Residents ({data.residents.length})</h2>
  <div class="app-table-wrap">
    <table class="app-table">
      <thead><tr><th>Resident</th><th>Code</th><th>Contact</th><th>Verification</th><th>Record status</th><th>Actions</th></tr></thead>
      <tbody>
        {#each data.residents as resident}
          <tr>
            <td>{resident.first_name} {resident.middle_name ?? ''} {resident.last_name} {resident.suffix ?? ''}</td>
            <td>{resident.resident_code}</td>
            <td>{resident.contact_number ?? '—'}</td>
            <td><span class="status-badge">{resident.verification_status}</span></td>
            <td>{resident.record_status}</td>
            <td>
              <div class="inline-form">
                <button class="app-button secondary" type="button" onclick={() => (editing = resident)}>Edit</button>
                {#if resident.record_status === 'active'}
                  <form method="POST" action="?/archive" use:enhance>
                    <input type="hidden" name="resident_id" value={resident.resident_id} />
                    <button class="app-button danger" type="submit">Mark inactive</button>
                  </form>
                {/if}
              </div>
            </td>
          </tr>
        {:else}
          <tr><td colspan="6" class="text-muted">No resident records are available.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
