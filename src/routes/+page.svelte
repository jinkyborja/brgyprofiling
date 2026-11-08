<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  let { form }: { form: ActionData } = $props();
  let showRegistration = $state(false);
</script>

<svelte:head>
  <title>Sign in | Barangay San Isidro</title>
  <meta name="description" content="Sign in to the Barangay San Isidro information management system." />
</svelte:head>

<main class="auth-page">
  <div class="auth-layout">
    <aside class="auth-aside">
      <div class="brand-mark" aria-hidden="true">SI</div>
      <p class="auth-eyebrow">BARANGAY SAN ISIDRO</p>
      <h1>Community services, made clearer.</h1>
      <p class="auth-intro">A secure point of access for community records and local services.</p>
      <ul class="auth-benefits">
        <li>✓ <span>Secure access to your account</span></li>
        <li>✓ <span>Resident accounts reviewed by the barangay</span></li>
        <li>✓ <span>Role access assigned by an administrator</span></li>
      </ul>
      <small class="auth-aside-footer">Barangay San Isidro Information Management System</small>
    </aside>

    <section class="auth-main">
      {#if !showRegistration}
        <div class="form-container">
          <h2 class="form-title">Welcome back</h2>
          <p class="auth-subtitle">Sign in to continue to your account.</p>
          {#if form?.loginError}
            <p class="notice error" role="alert">{form.loginError}</p>
          {/if}
          <form method="POST" action="?/login" use:enhance class="app-form">
            <label>
              Username or email
              <input name="username" autocomplete="username" required />
            </label>
            <label>
              Password
              <input type="password" name="password" autocomplete="current-password" required />
            </label>
            <button type="submit" class="app-button">Sign in</button>
          </form>
          <p class="notice">New resident account requests require administrator approval before sign-in.</p>
          <p class="auth-switch">New resident? <button type="button" onclick={() => (showRegistration = true)}>Create an account</button></p>
        </div>
      {:else}
        <div class="form-container">
          <h2 class="form-title">Create a resident account</h2>
          <p class="auth-subtitle">Submit a request for review by a barangay administrator.</p>
          {#if form?.registerError}
            <p class="notice error" role="alert">{form.registerError}</p>
          {/if}
          {#if form?.registerSuccess}
            <p class="notice success" role="status">{form.registerSuccess}</p>
          {/if}
          <form method="POST" action="?/register" use:enhance class="app-form">
            <div class="field-row">
              <label>First name<input name="first_name" autocomplete="given-name" maxlength="100" required /></label>
              <label>Last name<input name="last_name" autocomplete="family-name" maxlength="100" required /></label>
            </div>
            <label>Email address<input type="email" name="email" autocomplete="email" maxlength="254" required /></label>
            <label>Username<input name="new_username" autocomplete="username" minlength="3" maxlength="80" pattern="[A-Za-z0-9._-]+" required /></label>
            <label>Password<input type="password" name="new_password" autocomplete="new-password" minlength="12" maxlength="72" required /></label>
            <button type="submit" class="app-button">Request account</button>
          </form>
          <p class="notice">Public requests can create resident accounts only. Administrator and staff access cannot be requested here.</p>
          <p class="auth-switch">Already have an account? <button type="button" onclick={() => (showRegistration = false)}>Sign in</button></p>
        </div>
      {/if}
    </section>
  </div>
</main>
