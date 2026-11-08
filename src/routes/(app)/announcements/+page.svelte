<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing = $state<PageData['announcements'][number] | null>(null);
</script>

<svelte:head><title>Announcements | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div><h1>Announcements</h1><p>Official updates published by the barangay.</p></div>
</div>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

{#if data.canManage}
  <section class="app-card">
    <h2>{editing ? 'Edit announcement' : 'Create announcement'}</h2>
    <form method="POST" action="?/save" use:enhance class="app-form">
      {#if editing}<input type="hidden" name="announcement_id" value={editing.announcement_id} />{/if}
      <label>Title<input name="title" maxlength="180" value={editing?.title ?? ''} required /></label>
      <label>Announcement<textarea name="body" maxlength="20000" required>{editing?.body ?? ''}</textarea></label>
      <div class="field-row">
        <label>Audience
          <select name="audience" value={editing?.audience ?? 'public'} required>
            <option value="public">Public</option>
            <option value="residents">Residents</option>
            <option value="staff">Staff</option>
            <option value="all_users">All signed-in users</option>
          </select>
        </label>
        <label>Target purok (optional; resident audience only)
          <input name="target_purok" maxlength="80" value={editing?.target_purok ?? ''} />
        </label>
      </div>
      <div class="inline-form">
        <button class="app-button" type="submit">{editing ? 'Save changes' : 'Save draft'}</button>
        {#if editing}<button class="app-button secondary" type="button" onclick={() => (editing = null)}>Cancel edit</button>{/if}
      </div>
    </form>
  </section>
{/if}

<section class="announcement-list" aria-label="Announcements">
  {#each data.announcements as announcement}
    <article class="app-card">
      <div class="page-heading">
        <div><h2>{announcement.title}</h2><p>{announcement.audience} · {announcement.status}</p></div>
        {#if data.canManage}
          <button class="app-button secondary" type="button" onclick={() => (editing = announcement)}>Edit</button>
        {/if}
      </div>
      <p class="announcement-body">{announcement.body}</p>
      <p class="text-muted">
        {announcement.status === 'published' && announcement.published_at
          ? `Published ${new Date(announcement.published_at).toLocaleString()}`
          : `Created ${new Date(announcement.created_at).toLocaleString()}`}
        {#if announcement.target_purok} · Purok {announcement.target_purok}{/if}
      </p>
      {#if data.canManage}
        <div class="inline-form">
          {#if announcement.status !== 'published'}
            <form method="POST" action="?/updateStatus" use:enhance>
              <input type="hidden" name="announcement_id" value={announcement.announcement_id} />
              <input type="hidden" name="status" value="published" />
              <button class="app-button" type="submit">Publish now</button>
            </form>
          {/if}
          {#if announcement.status !== 'archived'}
            <form method="POST" action="?/updateStatus" use:enhance>
              <input type="hidden" name="announcement_id" value={announcement.announcement_id} />
              <input type="hidden" name="status" value="archived" />
              <button class="app-button danger" type="submit">Archive</button>
            </form>
          {:else}
            <form method="POST" action="?/updateStatus" use:enhance>
              <input type="hidden" name="announcement_id" value={announcement.announcement_id} />
              <input type="hidden" name="status" value="draft" />
              <button class="app-button secondary" type="submit">Restore as draft</button>
            </form>
          {/if}
        </div>
      {/if}
    </article>
  {:else}
    <p class="text-muted">There are no announcements to show.</p>
  {/each}
</section>
