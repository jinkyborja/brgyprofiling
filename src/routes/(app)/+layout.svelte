<script lang="ts">
  import { page } from '$app/state';
  import type { LayoutData } from './$types';

  let { children, data }: { children: import('svelte').Snippet; data: LayoutData } = $props();
  const links = [
    { href: '/dashboard', title: 'Dashboard', permission: null },
    { href: '/info', title: 'Barangay information', permission: null },
    { href: '/residents', title: 'Residents', permission: 'residents.read' },
    { href: '/households', title: 'Households', permission: 'households.read' },
    { href: '/officials', title: 'Barangay officials', permission: null },
    { href: '/certificates', title: 'Certificate requests', permission: null },
    { href: '/announcements', title: 'Announcements', permission: 'announcements.read' },
    { href: '/concerns', title: 'Community concerns', permission: null },
    { href: '/messages', title: 'Messages', permission: 'messages.read' },
    { href: '/notifications', title: 'Notifications', permission: null },
    { href: '/users', title: 'User requests', permission: 'users.manage' }
  ];
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="app-shell">
  <aside class="app-sidebar">
    <div class="app-brand">
      <strong>Barangay San Isidro</strong>
      <span>Information Management System</span>
    </div>
    <nav class="app-nav" aria-label="Main navigation">
      {#each links as link}
        {#if !link.permission || data.user.permissions.includes(link.permission)}
          <a href={link.href} aria-current={page.url.pathname === link.href ? 'page' : undefined}>
            {link.title}
          </a>
        {/if}
      {/each}
    </nav>
  </aside>

  <div class="app-main">
    <header class="app-topbar">
      <div>
        <strong>{data.user.username}</strong>
        <span class="text-muted"> · {data.user.roles.join(', ')}</span>
      </div>
      <form method="POST" action="/logout">
        <button class="app-button secondary" type="submit">Sign out</button>
      </form>
    </header>
    <main class="app-content">
      {@render children()}
    </main>
  </div>
</div>
