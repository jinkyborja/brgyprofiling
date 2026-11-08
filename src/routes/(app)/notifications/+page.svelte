<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Notifications | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div>
    <h1>Notifications</h1>
    <p>{data.unreadCount} unread notification{data.unreadCount === 1 ? '' : 's'}.</p>
  </div>
  {#if data.unreadCount}
    <form method="POST" action="?/markAllRead" use:enhance>
      <button class="app-button secondary" type="submit">Mark all as read</button>
    </form>
  {/if}
</div>

{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

<section class="app-card notification-list" aria-label="Your notifications">
  {#each data.notifications as notification}
    <article class:unread={!notification.read_at} class="notification-item">
      <div>
        <p class="notification-meta">
          <span class="status-badge">{notification.notification_type}</span>
          <time datetime={notification.created_at}>{new Date(notification.created_at).toLocaleString()}</time>
        </p>
        <h2>{notification.title}</h2>
        <p>{notification.body}</p>
        {#if notification.related_entity_type === 'document_request'}
          <a href="/certificates">View document requests</a>
        {:else if notification.related_entity_type === 'concern'}
          <a href="/concerns">View concerns</a>
        {:else if notification.related_entity_type === 'message_thread' && notification.related_entity_id}
          <a href={`/messages?thread=${notification.related_entity_id}`}>View conversation</a>
        {/if}
      </div>
      {#if !notification.read_at}
        <form method="POST" action="?/markRead" use:enhance>
          <input type="hidden" name="notification_id" value={notification.notification_id} />
          <button class="app-button secondary" type="submit">Mark as read</button>
        </form>
      {:else}
        <span class="text-muted">Read</span>
      {/if}
    </article>
  {:else}
    <p class="text-muted">You have no notifications.</p>
  {/each}
</section>
