<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData, PageData } from './$types';

  let { data, form }: { data: PageData; form: ActionData } = $props();
  let editing = $state<PageData['certificates'][number] | null>(null);
</script>

<svelte:head><title>Certificate requests | Barangay San Isidro</title></svelte:head>

<div class="page-heading">
  <div><h1>Certificate and document requests</h1><p>Requests and transitions are stored in the MySQL request history.</p></div>
</div>
{#if form?.error}<p class="notice error" role="alert">{form.error}</p>{/if}
{#if form?.success}<p class="notice success" role="status">{form.success}</p>{/if}

{#if data.canManageCertificates}
  <section class="app-card">
    <h2>{editing ? `Edit ${editing.certificate_code}` : 'Certificate record'}</h2>
    <form method="POST" action="?/saveCertificate" use:enhance class="app-form">
      {#if editing}<input type="hidden" name="certificate_record_id" value={editing.certificate_record_id} />{/if}
      <div class="field-row">
        <label>Certificate type
          <select name="certificate_type" value={editing?.certificate_type ?? 'Barangay Clearance'} required>
            {#each ['Barangay Clearance', 'Indigency Certificate', 'Residency Certificate', 'Business Permit', 'Other'] as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </label>
        <label>Resident (optional)
          <select name="resident_id" value={editing?.resident_id ?? ''}>
            <option value="">Not linked to a resident record</option>
            {#each data.residents as resident}
              <option value={resident.resident_id}>{resident.full_name}</option>
            {/each}
          </select>
        </label>
      </div>
      <div class="field-row">
        <label>Recipient name<input name="recipient_name" maxlength="200" value={editing?.recipient_name ?? ''} required /></label>
        <label>Recipient address<input name="recipient_address" maxlength="255" value={editing?.recipient_address ?? ''} required /></label>
      </div>
      <label>Purpose<textarea name="certificate_purpose" maxlength="10000" required>{editing?.purpose ?? ''}</textarea></label>
      <div class="field-row">
        <label>Date issued<input type="date" name="date_issued" value={editing?.date_issued?.slice(0, 10) ?? new Date().toISOString().slice(0, 10)} required /></label>
        <label>Valid until<input type="date" name="valid_until" value={editing?.valid_until?.slice(0, 10) ?? ''} /></label>
      </div>
      <div class="field-row">
        <label>Status
          <select name="certificate_status" value={editing?.status ?? 'Pending'} required>
            {#each ['Issued', 'Pending', 'Cancelled'] as status}<option value={status}>{status}</option>{/each}
          </select>
        </label>
        <label>Fee (PHP)<input type="number" name="fee" min="0" step="0.01" value={editing?.fee ?? '0.00'} /></label>
      </div>
      <label>Remarks<textarea name="remarks" maxlength="10000">{editing?.remarks ?? ''}</textarea></label>
      <div class="inline-form">
        <button class="app-button" type="submit">{editing ? 'Save changes' : 'Save certificate'}</button>
        {#if editing}<button class="app-button secondary" type="button" onclick={() => (editing = null)}>Cancel edit</button>{/if}
      </div>
    </form>
  </section>

  <section class="app-card">
    <div class="page-heading">
      <div><h2>Certificate register ({data.certificates.length})</h2><p>Archived records remain stored and can be restored.</p></div>
      <form method="GET" action="/certificates" class="inline-form">
        <input name="certificateSearch" maxlength="100" value={data.certificateSearch} placeholder="Search code or recipient" />
        <select name="certificateType" aria-label="Filter by certificate type" value={data.certificateType}>
          <option value="">All types</option>
          {#each ['Barangay Clearance', 'Indigency Certificate', 'Residency Certificate', 'Business Permit', 'Other'] as type}
            <option value={type}>{type}</option>
          {/each}
        </select>
        <select name="certificateStatus" aria-label="Filter by certificate status" value={data.certificateStatus}>
          <option value="">All statuses</option>
          {#each ['Issued', 'Pending', 'Cancelled'] as status}<option value={status}>{status}</option>{/each}
        </select>
        <button class="app-button secondary" type="submit">Search</button>
      </form>
    </div>
    <div class="app-table-wrap">
      <table class="app-table">
        <thead><tr><th>Certificate ID</th><th>Type</th><th>Recipient</th><th>Purpose</th><th>Issued</th><th>Status</th><th>Fee</th><th>Actions</th></tr></thead>
        <tbody>
          {#each data.certificates as certificate}
            <tr>
              <td>{certificate.certificate_code}</td><td>{certificate.certificate_type}</td>
              <td>{certificate.recipient_name}<br /><span class="text-muted">{certificate.recipient_address}</span></td>
              <td>{certificate.purpose}</td><td>{certificate.date_issued.slice(0, 10)}</td>
              <td><span class="status-badge">{certificate.archived_at ? 'Archived' : certificate.status}</span></td>
              <td>₱{certificate.fee}</td>
              <td>
                <div class="inline-form">
                  {#if !certificate.archived_at}
                    <button class="app-button secondary" type="button" onclick={() => (editing = certificate)}>Edit</button>
                    {#if certificate.status === 'Issued'}<a class="app-button secondary" href={`/certificates/${certificate.certificate_record_id}`}>Print</a>{/if}
                    <form method="POST" action="?/archiveCertificate" use:enhance>
                      <input type="hidden" name="certificate_record_id" value={certificate.certificate_record_id} />
                      <button class="app-button danger" type="submit">Archive</button>
                    </form>
                  {:else}
                    <form method="POST" action="?/restoreCertificate" use:enhance>
                      <input type="hidden" name="certificate_record_id" value={certificate.certificate_record_id} />
                      <button class="app-button secondary" type="submit">Restore</button>
                    </form>
                  {/if}
                </div>
              </td>
            </tr>
          {:else}
            <tr><td colspan="8" class="text-muted">No certificate records match this search.</td></tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
{/if}

{#if data.isResident}
  <section class="app-card">
    <h2>Request a document</h2>
    {#if data.documentTypes.length}
      <form method="POST" action="?/create" use:enhance class="app-form">
        <label>Document type
          <select name="document_type_id" required>
            <option value="">Select a document</option>
            {#each data.documentTypes as type}
              <option value={type.document_type_id}>{type.name}{type.fee !== null ? ` — ₱${type.fee}` : ''}</option>
            {/each}
          </select>
        </label>
        <label>Purpose<input name="purpose" maxlength="255" required /></label>
        <label>Additional notes<textarea name="resident_notes" maxlength="5000"></textarea></label>
        <button class="app-button" type="submit">Submit request</button>
      </form>
    {:else}
      <p class="text-muted">No document services are currently available. Contact the barangay for service information.</p>
    {/if}
  </section>
{/if}

<section class="app-card">
  <h2>Requests ({data.requests.length})</h2>
  <div class="app-table-wrap">
    <table class="app-table">
      <thead><tr>{#if data.canReview}<th>Resident</th>{/if}<th>Request</th><th>Document</th><th>Purpose</th><th>Submitted</th><th>Status</th>{#if data.canReview}<th>Update status</th>{/if}</tr></thead>
      <tbody>
        {#each data.requests as item}
          <tr>
            {#if data.canReview}<td>{item.resident_name}</td>{/if}
            <td>{item.request_code}</td><td>{item.document_name}</td><td>{item.purpose}</td>
            <td>{new Date(item.submitted_at).toLocaleDateString()}</td>
            <td><span class="status-badge">{item.status}</span></td>
            {#if data.canReview}
              <td>
                <form method="POST" action="?/updateStatus" use:enhance class="inline-form">
                  <input type="hidden" name="request_id" value={item.request_id} />
                  <select name="status" aria-label={`Next status for ${item.request_code}`}>
                    {#each ['queued', 'in_review', 'correction_required', 'approved', 'rejected', 'ready_for_release', 'released'] as status}
                      <option value={status}>{status}</option>
                    {/each}
                  </select>
                  <button class="app-button" type="submit">Update</button>
                </form>
              </td>
            {:else if data.isResident && ['submitted', 'queued'].includes(item.status)}
              <td>
                <form method="POST" action="?/updateStatus" use:enhance>
                  <input type="hidden" name="request_id" value={item.request_id} />
                  <input type="hidden" name="status" value="cancelled" />
                  <button class="app-button danger" type="submit">Cancel request</button>
                </form>
              </td>
            {/if}
          </tr>
        {:else}
          <tr><td colspan={data.canReview ? 7 : 6} class="text-muted">No document requests are available.</td></tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>
