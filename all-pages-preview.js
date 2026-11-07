(() => {
    const catalog = window.previewCatalog || [];
    const checkStorageKey = 'barangayPreviewReviewChecks';
    const localHost = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

    document.addEventListener('DOMContentLoaded', () => {
        if (!localHost) {
            document.body.innerHTML = '<main class="preview-blocked"><h1>Local preview only</h1><p>The page directory is available only from a local file or localhost development server.</p></main>';
            return;
        }
        renderDirectory();
        renderMetrics();
        document.getElementById('page-search').addEventListener('input', renderDirectory);
        document.getElementById('group-filter').addEventListener('change', renderDirectory);
        document.getElementById('legacy-filter').addEventListener('change', renderDirectory);
        document.getElementById('page-directory').addEventListener('change', handleReviewChange);
        document.getElementById('reset-checklist').addEventListener('click', resetChecks);
        document.getElementById('page-directory').addEventListener('click', event => {
            const link = event.target.closest('a[data-preview-link]');
            if (link) link.dataset.opened = 'true';
        });
    });

    function previewUrl(page) {
        if (page.target === 'public') return 'public-preview.html?page=' + encodeURIComponent(page.id);
        return 'ui-prototype.html?role=' + encodeURIComponent(page.target) + '&page=' + encodeURIComponent(page.id);
    }

    function reviewedPages() {
        const stored = localStorage.getItem(checkStorageKey);
        if (!stored) return {};
        let parsed;
        try {
            parsed = JSON.parse(stored);
        } catch (error) {
            if (!(error instanceof SyntaxError)) throw error;
            localStorage.removeItem(checkStorageKey);
            console.error('The saved preview checklist was invalid and has been cleared.', error);
            return {};
        }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new TypeError('The saved preview checklist must contain a page-key map.');
        }
        return parsed;
    }

    function renderMetrics() {
        const existing = catalog.filter(page => ['Existing', 'Partial', 'Incomplete'].includes(page.legacy)).length;
        const missing = catalog.filter(page => page.legacy === 'Missing').length;
        const incomplete = catalog.filter(page => ['Partial', 'Incomplete'].includes(page.legacy)).length;
        const ready = catalog.filter(page => page.design === 'Designed').length;
        document.getElementById('metric-total').textContent = catalog.length;
        document.getElementById('metric-existing').textContent = existing;
        document.getElementById('metric-missing').textContent = missing;
        document.getElementById('metric-incomplete').textContent = incomplete;
        document.getElementById('metric-ready').textContent = ready;
        const responsiveIssues = catalog.filter(page => page.responsive === 'Issue').length;
        const responsiveChecked = catalog.every(page => page.responsive === 'Checked at 5 widths');
        document.getElementById('metric-responsive').textContent = responsiveIssues ? responsiveIssues : responsiveChecked ? '0' : 'Not checked';
        const validPages = {
            public: new Set(['homepage','login','registration','forgot-password','reset-password','announcements','contact']),
            resident: new Set(['dashboard','profile','household','request-service','my-requests','request-details','announcements','concerns','notifications','settings']),
            staff: new Set(['dashboard','resident-records','household-records','assigned-requests','verification','concerns','announcements','messages','activity']),
            admin: new Set(['dashboard','residents','households','requests','documents','staff','concerns','announcements','reports','audit','settings'])
        };
        const valid = catalog.every(page => {
            const url = new URL(previewUrl(page), location.href);
            return validPages[page.target]?.has(page.id) &&
                url.pathname.endsWith(page.target === 'public' ? 'public-preview.html' : 'ui-prototype.html') &&
                (page.target === 'public' ? url.searchParams.get('page') === page.id :
                    url.searchParams.get('role') === page.target && url.searchParams.get('page') === page.id);
        });
        document.getElementById('metric-broken').textContent = valid ? '0' : String(catalog.filter(page => !previewUrl(page)).length || 'Check routes');
        updateQaSummary();
    }

    function renderDirectory() {
        const query = document.getElementById('page-search').value.trim().toLowerCase();
        const group = document.getElementById('group-filter').value;
        const legacy = document.getElementById('legacy-filter').value;
        const checks = reviewedPages();
        const visible = catalog.filter(page =>
            (!group || page.group === group) &&
            (!legacy || page.legacy === legacy) &&
            (!query || (page.group + ' ' + page.name + ' ' + page.legacy).toLowerCase().includes(query))
        );
        document.getElementById('visible-count').textContent = 'Showing ' + visible.length + ' of ' + catalog.length + ' pages';
        document.getElementById('page-directory').innerHTML = visible.map(page => {
            const legacyClass = page.legacy.toLowerCase();
            const link = previewUrl(page);
            const responsive = page.responsive;
            const isChecked = checks[page.target + ':' + page.id] === true;
            return '<tr data-page-key="' + escapeAttr(page.target + ':' + page.id) + '">' +
                '<td>' + escapeHtml(page.group) + '</td><td><strong>' + escapeHtml(page.name) + '</strong></td>' +
                '<td><span class="status status-legacy-' + legacyClass + '">' + escapeHtml(page.legacy) + '</span></td>' +
                '<td><span class="status ' + (page.design === 'Designed' ? 'status-preview' : 'status-preview-missing') + '">' + escapeHtml(page.design) + '</span></td>' +
                '<td>' + responsive + '</td><td><label class="review-control"><input class="review-checkbox" type="checkbox" aria-label="Mark ' + escapeAttr(page.group + ' ' + page.name) + ' as personally reviewed"' + (isChecked ? ' checked' : '') + '>' + (isChecked ? 'Reviewed' : 'Review') + '</label></td>' +
                '<td><a class="table-action" data-preview-link href="' + escapeAttr(link) + '">Open preview</a></td></tr>';
        }).join('') || '<tr><td class="table-empty" colspan="7">No pages match these filters.</td></tr>';
    }

    function handleReviewChange(event) {
        if (!event.target.matches('.review-checkbox')) return;
        const key = event.target.closest('[data-page-key]').dataset.pageKey;
        const checks = reviewedPages();
        checks[key] = event.target.checked;
        localStorage.setItem(checkStorageKey, JSON.stringify(checks));
        updateQaSummary();
    }

    function updateQaSummary() {
        const checked = Object.values(reviewedPages()).filter(Boolean).length;
        document.getElementById('qa-summary').textContent = checked + ' of ' + catalog.length + ' pages marked reviewed by you in this browser. Unchecked pages are not user-reviewed.';
    }

    function resetChecks() {
        localStorage.removeItem(checkStorageKey);
        renderDirectory();
        updateQaSummary();
        const region = document.getElementById('catalog-toast');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = 'Your local review checklist was reset. No project data was changed.';
        region.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }
})();
