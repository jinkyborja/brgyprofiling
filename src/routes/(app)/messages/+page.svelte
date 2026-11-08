<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head><title>Messages | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div><h1>Messages</h1><p>Private conversations available to their listed participants.</p></div>
</div>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

{#if data.canCreateThread}
  <section class="app-card">
    <h2>Start a conversation</h2>
    <form method="POST" action="?/create" use:enhance class="app-form">
      <label>Recipient
        <select name="recipient_user_id" required>
          <option value="">Select an account</option>
          {#each data.recipients as recipient}
            <option value={recipient.user_id}>{recipient.username} ({recipient.role_code})</option>
          {/each}
        </select>
      </label>
      <label>Subject<input name="subject" maxlength="180" required /></label>
      <label>Message<textarea name="body" maxlength="5000" required></textarea></label>
      <button class="app-button" type="submit">Start conversation</button>
    </form>
  </section>
{/if}

<div class="message-layout">
  <section class="app-card message-threads">
    <h2>Conversations</h2>
    {#each data.threads as thread}
      <a class:active={data.selectedThread?.thread_id === thread.thread_id}
        class="message-thread-link" href={`/messages?thread=${thread.thread_id}`}>
        <strong>{thread.subject}</strong>
        <span>{thread.last_message ?? 'No messages yet'}</span>
        {#if thread.unread_count > 0}<span class="status-badge">{thread.unread_count} unread</span>{/if}
      </a>
    {:else}
      <p class="text-muted">No conversations yet.</p>
    {/each}
  </section>

  <section class="app-card message-conversation">
    {#if data.selectedThread}
      <h2>{data.selectedThread.subject}</h2>
      <div class="message-history" aria-label="Conversation messages">
        {#each data.messages as message}
          <article class:own-message={message.sender_username === data.username} class="message-bubble">
            <div><strong>{message.sender_username}</strong><time datetime={message.sent_at}>{new Date(message.sent_at).toLocaleString()}</time></div>
            <p>{message.body}</p>
          </article>
        {:else}
          <p class="text-muted">No messages in this conversation yet.</p>
        {/each}
      </div>
      {#if data.messages.length < 300}
        <form method="POST" action="?/send" use:enhance class="app-form">
          <input type="hidden" name="thread_id" value={data.selectedThread.thread_id} />
          <label>Reply<textarea name="body" maxlength="5000" required></textarea></label>
          <button class="app-button" type="submit">Send message</button>
        </form>
      {:else}
        <p class="text-muted">This conversation shows the latest 300 messages. Start a new thread to continue.</p>
      {/if}
    {:else}
      <p class="text-muted">Select a conversation to view its messages.</p>
    {/if}
  </section>
</div>
