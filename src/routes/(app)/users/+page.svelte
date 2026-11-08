<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>User management | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div><h1>User management</h1><p>Review resident account requests and role assignments.</p></div>
</div>
<p class="notice">Approving an account enables sign-in; it does not mark the resident as verified. Review those decisions separately.</p>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

<section class="app-card">
  <h2>Accounts ({data.accounts.length})</h2>
  <div class="app-table-wrap">
    <table class="app-table">
      <thead><tr><th>Account</th><th>Resident</th><th>Status</th><th>Roles</th><th>Update status</th><th>Assign role</th></tr></thead>
      <tbody>
        {#each data.accounts as account}
          <tr>
            <td><strong>{account.username}</strong><br /><span class="text-muted">{account.email}</span></td>
            <td>{account.resident_name ?? '—'}</td>
            <td><span class="status-badge">{account.account_status}</span></td>
            <td>
              {#each (account.roles ?? '').split(', ').filter(Boolean) as role}
                <div class="inline-form">
                  <span>{role}</span>
                  <form method="POST" action="?/setRole" use:enhance>
                    <input type="hidden" name="user_id" value={account.user_id} />
                    <input type="hidden" name="role_code" value={role} />
                    <input type="hidden" name="operation" value="remove" />
                    <button class="app-button secondary" type="submit" aria-label={`Remove ${role} role from ${account.username}`}>Remove</button>
                  </form>
                </div>
              {/each}
            </td>
            <td>
              <form method="POST" action="?/setStatus" use:enhance class="inline-form">
                <input type="hidden" name="user_id" value={account.user_id} />
                <select name="account_status" aria-label={`Status for ${account.username}`}>
                  {#each ['pending_approval', 'active', 'suspended', 'deactivated'] as status}
                    <option value={status} selected={status === account.account_status}>{status}</option>
                  {/each}
                </select>
                <button class="app-button" type="submit">Save</button>
              </form>
            </td>
            <td>
              <form method="POST" action="?/setRole" use:enhance class="inline-form">
                <input type="hidden" name="user_id" value={account.user_id} />
                <input type="hidden" name="operation" value="assign" />
                <select name="role_code" aria-label={`Role to assign to ${account.username}`}>
                  {#each data.roles as role}<option value={role.role_code}>{role.display_name}</option>{/each}
                </select>
                <button class="app-button" type="submit">Assign</button>
              </form>
            </td>
          </tr>
        {:else}
          <tr><td colspan="6" class="text-muted">No user accounts are available.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
