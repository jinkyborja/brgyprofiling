<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  const certificate = $derived(data.certificate);
</script>

<svelte:head>
  <title>{certificate.certificate_type} | Barangay San Isidro</title>
</svelte:head>

<div class="page-heading print-actions">
  <div><h1>Certificate preview</h1><p>Review the details before printing.</p></div>
  <div class="inline-form">
    <button class="app-button" type="button" onclick={() => window.print()}>Print certificate</button>
    <a class="app-button secondary" href="/certificates">Back to certificates</a>
  </div>
</div>

<article class="certificate-sheet">
  <header class="certificate-header">
    <p>REPUBLIC OF THE PHILIPPINES</p>
    <p>BARANGAY SAN ISIDRO</p>
    <h1>{certificate.certificate_type}</h1>
    <p class="certificate-code">Certificate No. {certificate.certificate_code}</p>
  </header>

  <div class="certificate-body">
    <p>TO WHOM IT MAY CONCERN:</p>
    <p>
      This document is issued to <strong>{certificate.recipient_name}</strong>,
      residing at <strong>{certificate.recipient_address}</strong>, for the following purpose:
    </p>
    <p class="certificate-purpose">{certificate.purpose}</p>
    {#if certificate.remarks}<p>{certificate.remarks}</p>{/if}
    <p class="certificate-issued">
      Issued this {certificate.date_issued.slice(0, 10)}
      {#if certificate.valid_until} and valid until {certificate.valid_until.slice(0, 10)}{/if}.
    </p>
  </div>

  <footer class="certificate-signatures">
    <div><span>Prepared by</span><strong>Barangay Staff</strong></div>
    <div><span>Approved by</span><strong>Barangay Chairperson</strong></div>
  </footer>
</article>
