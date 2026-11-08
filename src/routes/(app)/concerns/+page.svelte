<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Community concerns | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div><h1>Community concerns</h1><p>Submit and track concerns or review those assigned to your team.</p></div>
</div>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

{#if data.canCreate}
  <section class="app-card">
    <h2>Submit a concern</h2>
    <form method="POST" action="?/create" use:enhance class="app-form">
      <div class="field-row">
        <label>Category
          <select name="category" required>
            <option value="">Select a category</option>
            {#each ['General', 'Sanitation', 'Infrastructure', 'Safety', 'Social services', 'Other'] as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </label>
        <label>Priority
          <select name="priority" required>
            {#each ['low', 'normal', 'high', 'urgent'] as priority}<option value={priority}>{priority}</option>{/each}
          </select>
        </label>
      </div>
      <label>Subject<input name="subject" maxlength="180" required /></label>
      <label>Description<textarea name="description" minlength="10" maxlength="10000" required></textarea></label>
      <button class="app-button" type="submit">Submit concern</button>
    </form>
  </section>
{/if}

<section class="app-card">
  <h2>Concerns ({data.concerns.length})</h2>
  <div class="app-table-wrap">
    <table class="app-table">
      <thead>
        <tr>
          {#if data.canReview}<th>Resident</th>{/if}
          <th>Concern</th><th>Category</th><th>Priority</th><th>Details</th><th>Status</th>
          {#if data.canReview}<th>Workflow</th>{/if}
        </tr>
      </thead>
      <tbody>
        {#each data.concerns as concern}
          <tr>
            {#if data.canReview}<td>{concern.resident_name}</td>{/if}
            <td>{concern.concern_code}<br /><span class="text-muted">{concern.subject}</span></td>
            <td>{concern.category}</td><td><span class="status-badge">{concern.priority}</span></td>
            <td class="concern-description">{concern.description}</td><td><span class="status-badge">{concern.status}</span></td>
            {#if data.canReview}
              <td>
                {#if data.canManage && !['closed', 'rejected', 'cancelled'].includes(concern.status)}
                  <form method="POST" action="?/assign" use:enhance class="app-form compact-form">
                    <input type="hidden" name="concern_id" value={concern.concern_id} />
                    <select name="staff_user_id" aria-label={`Assign ${concern.concern_code} to staff`} required>
                      <option value="">Assign staff</option>
                      {#each data.staff as member}<option value={member.user_id}>{member.username}</option>{/each}
                    </select>
                    <button class="app-button secondary" type="submit">Assign</button>
                  </form>
                {/if}
                <form method="POST" action="?/updateStatus" use:enhance class="app-form compact-form">
                  <input type="hidden" name="concern_id" value={concern.concern_id} />
                  <select name="status" aria-label={`Next status for ${concern.concern_code}`}>
                    {#each ['assigned', 'investigating', 'awaiting_resident', 'resolved', 'closed', 'rejected'] as status}
                      <option value={status}>{status}</option>
                    {/each}
                  </select>
                  <input name="reason" maxlength="1000" placeholder="Optional note" aria-label="Status change note" />
                  <button class="app-button" type="submit">Update</button>
                </form>
              </td>
            {/if}
          </tr>
        {:else}
          <tr><td colspan={data.canReview ? 7 : 5} class="text-muted">No concerns are available.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
