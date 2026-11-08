<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing = $state(false);
</script>

<svelte:head><title>Barangay information | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div><h1>Barangay information</h1><p>Verified contact and office details for the community.</p></div>
  {#if data.canManage && data.profile && !editing}
    <button class="app-button secondary" type="button" onclick={() => (editing = true)}>Edit profile</button>
  {/if}
</div>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

{#if data.canManage && (!data.profile || editing)}
  <section class="app-card">
    <h2>{data.profile ? 'Update barangay profile' : 'Set up barangay profile'}</h2>
    <form method="POST" action="?/save" use:enhance class="app-form">
      <label>Barangay name<input name="name" maxlength="180" value={data.profile?.name ?? ''} required /></label>
      <label>Address<input name="address" maxlength="500" value={data.profile?.address ?? ''} /></label>
      <div class="field-row">
        <label>Contact number<input name="contact_number" maxlength="40" value={data.profile?.contactNumber ?? ''} /></label>
        <label>Email address<input type="email" name="email" maxlength="254" value={data.profile?.email ?? ''} /></label>
      </div>
      <label>Office hours<input name="office_hours" maxlength="300" value={data.profile?.officeHours ?? ''} /></label>
      <label>About the barangay<textarea name="about" maxlength="5000">{data.profile?.about ?? ''}</textarea></label>
      <div class="inline-form">
        <button class="app-button" type="submit">Save information</button>
        {#if editing}<button class="app-button secondary" type="button" onclick={() => (editing = false)}>Cancel</button>{/if}
      </div>
    </form>
  </section>
{:else if data.profile}
  <section class="card-grid">
    <article class="app-card"><h2>{data.profile.name}</h2><p>{data.profile.about || 'Barangay profile.'}</p></article>
    <article class="app-card">
      <h2>Contact and office</h2>
      <dl class="profile-details">
        <dt>Address</dt><dd>{data.profile.address || 'Not provided'}</dd>
        <dt>Contact number</dt><dd>{data.profile.contactNumber || 'Not provided'}</dd>
        <dt>Email</dt><dd>{data.profile.email || 'Not provided'}</dd>
        <dt>Office hours</dt><dd>{data.profile.officeHours || 'Not provided'}</dd>
      </dl>
    </article>
  </section>
{:else}
  <section class="app-card">
    <h2>Profile information is not configured</h2>
    <p class="text-muted">
      Barangay contact details have not been verified and published yet.
      {#if !data.canManage}Contact a barangay administrator for assistance.{/if}
    </p>
  </section>
{/if}
