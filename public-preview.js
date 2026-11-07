(() => {
    const announcements = [
        {id:'ANN-031',title:'Community clean-up — Saturday, 7:00 AM',date:'Nov 06, 2026',category:'Community',body:'Meet at the barangay covered court. Bring reusable gloves and drinking water. This example notice is fictional.'},
        {id:'ANN-030',title:'Updated document counter hours',date:'Nov 04, 2026',category:'Services',body:'Sample service desk hours are Monday to Friday, 8:00 AM to 5:00 PM. Confirm official hours before visiting.'},
        {id:'ANN-029',title:'Water service interruption notice',date:'Nov 02, 2026',category:'Advisory',body:'Illustrative service advisory for preview purposes only.'},
        {id:'ANN-028',title:'Youth council registration',date:'Oct 29, 2026',category:'Community',body:'A sample community announcement. No registration is open through this demo.'}
    ];
    const pageNames = {
        homepage:'Home', login:'Sign in', registration:'Registration', 'forgot-password':'Forgot password',
        'reset-password':'Reset password', announcements:'Announcements', contact:'Contact'
    };
    const allowed = Object.keys(pageNames);
    const isLocal = location.protocol === 'file:' || ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
    let activePage = 'homepage';
    let announcementQuery = '';
    let announcementCategory = '';
    let announcementPage = 1;
    let modalReturnFocus = null;
    const pageSize = 3;

    document.addEventListener('DOMContentLoaded', initialize);

    function initialize() {
        if (!isLocal) {
            document.body.innerHTML = '<main class="preview-blocked"><h1>Local preview only</h1><p>These sample pages are available only from a local file or localhost development server.</p></main>';
            return;
        }
        activePage = new URLSearchParams(location.search).get('page') || 'homepage';
        if (!allowed.includes(activePage)) activePage = 'homepage';
        renderPage();
        document.getElementById('public-menu-button').addEventListener('click', toggleMenu);
        document.getElementById('public-content').addEventListener('click', handleClick);
        document.getElementById('public-content').addEventListener('input', handleInput);
        document.getElementById('public-content').addEventListener('change', handleInput);
        document.getElementById('public-content').addEventListener('submit', handleSubmit);
        document.getElementById('public-modal-close').addEventListener('click', closeAnnouncement);
        document.getElementById('public-modal').addEventListener('click', event => {
            if (event.target.id === 'public-modal') closeAnnouncement();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                closeAnnouncement();
                closeMenu();
            }
        });
        window.addEventListener('popstate', () => {
            activePage = new URLSearchParams(location.search).get('page') || 'homepage';
            renderPage();
        });
    }

    function renderPage() {
        document.title = pageNames[activePage] + ' Preview — Barangay San Isidro';
        document.querySelectorAll('[data-public-page]').forEach(link => {
            if (link.dataset.publicPage === activePage) link.setAttribute('aria-current','page');
            else link.removeAttribute('aria-current');
        });
        const content = document.getElementById('public-content');
        if (activePage === 'homepage') content.innerHTML = renderHome();
        else if (activePage === 'announcements') content.innerHTML = renderAnnouncements();
        else if (activePage === 'contact') content.innerHTML = renderContact();
        else content.innerHTML = renderAuthPage(activePage);
        closeMenu();
    }

    function renderHome() {
        return '<section class="public-hero"><div><p class="eyebrow">BARANGAY SAN ISIDRO · SAMPLE SITE</p><h1>Community services, made clearer.</h1><p>Find service information, review community notices, and preview the proposed resident portal. This local prototype is not an official channel.</p><div class="public-actions"><a class="button button-primary" href="ui-prototype.html?role=resident&amp;page=dashboard">Open resident portal preview</a><a class="button button-secondary" href="public-preview.html?page=announcements">Read sample announcements</a></div></div><aside class="public-callout"><h2>Service information</h2><p>Sample counter hours: Monday–Friday, 8:00 AM–5:00 PM.</p><p>Confirm current services and requirements with the barangay before visiting.</p><a href="public-preview.html?page=contact">Contact information →</a></aside></section><section class="public-section"><h2>Explore services</h2><div class="public-grid"><article class="public-card"><strong>Document services</strong><p>Preview service selection, sample requirements, and request tracking.</p><a href="ui-prototype.html?role=resident&amp;page=request-service">Preview documents</a></article><article class="public-card"><strong>Community notices</strong><p>Browse illustrative announcements and service advisories.</p><a href="public-preview.html?page=announcements">View announcements</a></article><article class="public-card"><strong>Community concerns</strong><p>Preview a concern reporting form; submissions are not delivered.</p><a href="ui-prototype.html?role=resident&amp;page=concerns">Preview report form</a></article></div></section><section class="public-section"><h2>Latest sample notice</h2><article class="announcement-card"><div><h2>' + escapeHtml(announcements[0].title) + '</h2><p>' + escapeHtml(announcements[0].date) + ' · Fictional sample notice</p></div><button class="button button-secondary" type="button" data-announcement="' + announcements[0].id + '">Read notice</button></article></section>';
    }

    function renderAuthPage(page) {
        const definitions = {
            login: ['Sign in','Sign in to continue to your account.','<div class="form-field"><label for="auth-username">Username</label><input id="auth-username" name="username" autocomplete="username" required></div><div class="form-field"><label for="auth-password">Password</label><div class="password-field"><input id="auth-password" type="password" autocomplete="current-password" required><button class="password-toggle" type="button" data-toggle-password="auth-password" aria-label="Show password" aria-pressed="false">Show</button></div></div><a href="public-preview.html?page=forgot-password">Forgot password?</a>'],
            registration: ['Request an account','Public registration is closed in the current application. This form is a visual example only.','<div class="form-grid"><div class="form-field"><label for="reg-name">Full name</label><input id="reg-name" required maxlength="120"></div><div class="form-field"><label for="reg-email">Email address</label><input id="reg-email" type="email" required></div></div><div class="form-field"><label for="reg-reference">Resident reference (sample)</label><input id="reg-reference" placeholder="Not validated in the preview"></div><label class="consent-label"><input type="checkbox" required> I understand that this demo does not create an account.</label>'],
            'forgot-password': ['Forgot password','A live service should send an expiring recovery link without disclosing whether an account exists. No email is sent here.','<div class="form-field"><label for="recovery-email">Email address</label><input id="recovery-email" type="email" autocomplete="email" required></div>'],
            'reset-password': ['Reset password','A real password reset needs a server-verified, expiring token. This preview does not change any password.','<div class="form-field"><label for="reset-code">Example reset code</label><input id="reset-code" required></div><div class="form-field"><label for="new-password">New password</label><input id="new-password" type="password" minlength="8" required></div><div class="form-field"><label for="confirm-password">Confirm password</label><input id="confirm-password" type="password" minlength="8" required></div>']
        };
        const [title, description, fields] = definitions[page];
        const submitLabel = page === 'login' ? 'Preview sign in' : page === 'registration' ? 'Preview account request' : page === 'forgot-password' ? 'Preview recovery request' : 'Preview password reset';
        return '<div class="panel public-form"><div class="panel-heading"><div><p class="eyebrow">PUBLIC PAGE · MOCK ONLY</p><h1>' + escapeHtml(title) + '</h1><p>' + escapeHtml(description) + '</p></div></div><form data-public-form="' + escapeAttr(page) + '">' + fields + '<p class="public-status" id="public-form-status" role="status" aria-live="polite"></p><button class="button button-primary" type="submit">' + submitLabel + '</button><p class="field-hint">Preview-only: no authentication, account creation, email, or password change occurs.</p></form></div>';
    }

    function renderContact() {
        return '<div class="public-page-heading"><p class="eyebrow">PUBLIC INFORMATION</p><h1>Contact the barangay</h1><p>Sample contact details are placeholders; confirm official information before publishing.</p></div><div class="public-grid"><article class="public-card"><strong>Barangay office</strong><p>Sample address: Barangay San Isidro, Philippines</p></article><article class="public-card"><strong>Office hours</strong><p>Illustrative hours: Monday–Friday, 8:00 AM–5:00 PM</p></article><article class="public-card"><strong>Contact details</strong><p>Phone and email have not been verified for publication.</p></article></div><section class="panel public-form public-section"><div class="panel-heading"><div><h2>Send a sample inquiry</h2><p>This message is not delivered or saved.</p></div></div><form data-public-form="contact"><div class="form-field"><label for="contact-name">Name</label><input id="contact-name" required maxlength="100"></div><div class="form-field"><label for="contact-email">Email</label><input id="contact-email" type="email" required></div><div class="form-field"><label for="contact-message">Message</label><textarea id="contact-message" required minlength="10" maxlength="1000"></textarea></div><button class="button button-primary" type="submit">Preview inquiry</button></form></section>';
    }

    function renderAnnouncements() {
        const filtered = announcements.filter(item =>
            (!announcementCategory || item.category === announcementCategory) &&
            (!announcementQuery || (item.title + ' ' + item.body + ' ' + item.category).toLowerCase().includes(announcementQuery))
        );
        const totalPages = Math.max(1,Math.ceil(filtered.length / pageSize));
        announcementPage = Math.min(announcementPage,totalPages);
        const visible = filtered.slice((announcementPage - 1) * pageSize, announcementPage * pageSize);
        const categories = [...new Set(announcements.map(item => item.category))];
        return '<div class="public-page-heading"><p class="eyebrow">PUBLIC INFORMATION</p><h1>Announcements</h1><p>Fictional notices for preview only; not official or current public guidance.</p></div><div class="toolbar"><div class="toolbar-start"><label class="search-field"><span class="sr-only">Search announcements</span><input id="announcement-search" type="search" placeholder="Search announcements" value="' + escapeAttr(announcementQuery) + '"></label><label><span class="sr-only">Filter announcements by category</span><select id="announcement-category" class="filter-select"><option value="">All categories</option>' + categories.map(category => '<option' + (category === announcementCategory ? ' selected' : '') + '>' + escapeHtml(category) + '</option>').join('') + '</select></label></div><span class="field-hint">' + filtered.length + ' sample notices</span></div><div class="announcement-list">' + (visible.length ? visible.map(item => '<article class="announcement-card"><div><p class="eyebrow">' + escapeHtml(item.category) + ' · ' + escapeHtml(item.date) + '</p><h2>' + escapeHtml(item.title) + '</h2><p>' + escapeHtml(item.body) + '</p></div><button class="button button-secondary" type="button" data-announcement="' + escapeAttr(item.id) + '">Details</button></article>').join('') : '<div class="empty-card"><strong>No matching sample notices</strong>Try a different search or category.</div>') + '</div><div class="table-footer"><span>Page ' + announcementPage + ' of ' + totalPages + '</span><nav class="pagination" aria-label="Announcement pages">' + (totalPages > 1 ? '<button type="button" data-announcement-page="' + (announcementPage - 1) + '"' + (announcementPage === 1 ? ' disabled' : '') + '>Previous</button><button type="button" data-announcement-page="' + (announcementPage + 1) + '"' + (announcementPage === totalPages ? ' disabled' : '') + '>Next</button>' : '') + '</nav></div>';
    }

    function handleClick(event) {
        const toggle = event.target.closest('[data-toggle-password]');
        if (toggle) {
            const input = document.getElementById(toggle.dataset.togglePassword);
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            toggle.setAttribute('aria-pressed',String(show));
            toggle.setAttribute('aria-label',show ? 'Hide password' : 'Show password');
            toggle.textContent = show ? 'Hide' : 'Show';
            return;
        }
        const announcementButton = event.target.closest('[data-announcement]');
        if (announcementButton) {
            const item = announcements.find(announcement => announcement.id === announcementButton.dataset.announcement);
            if (item) openAnnouncement(item, announcementButton);
            return;
        }
        const pageButton = event.target.closest('[data-announcement-page]');
        if (pageButton && !pageButton.disabled) {
            announcementPage = Number(pageButton.dataset.announcementPage);
            renderPage();
        }
    }

    function handleInput(event) {
        if (event.target.id === 'announcement-search') {
            announcementQuery = event.target.value.trim().toLowerCase();
            announcementPage = 1;
            renderPage();
            const input = document.getElementById('announcement-search');
            input.focus();
            input.setSelectionRange(input.value.length,input.value.length);
        }
        if (event.target.id === 'announcement-category') {
            announcementCategory = event.target.value;
            announcementPage = 1;
            renderPage();
        }
    }

    function handleSubmit(event) {
        const form = event.target.closest('[data-public-form]');
        if (!form) return;
        event.preventDefault();
        if (!form.reportValidity()) return;
        const password = form.querySelector('#new-password');
        const confirmation = form.querySelector('#confirm-password');
        if (password && password.value !== confirmation.value) {
            confirmation.setCustomValidity('Passwords do not match.');
            confirmation.reportValidity();
            confirmation.setCustomValidity('');
            return;
        }
        const status = document.getElementById('public-form-status');
        if (status) status.textContent = 'Form validated for preview only. Nothing was sent, authenticated, created, or changed.';
        toast('Preview only: no data was sent or saved.');
    }

    function openAnnouncement(item, trigger) {
        modalReturnFocus = trigger;
        document.getElementById('public-modal-title').textContent = item.title;
        document.getElementById('public-modal-body').innerHTML = '<p class="public-modal-copy">' + escapeHtml(item.date) + ' · ' + escapeHtml(item.category) + '</p><p>' + escapeHtml(item.body) + '</p><p class="field-hint">This notice is fictional sample data.</p>';
        document.getElementById('public-modal').hidden = false;
        document.getElementById('public-modal-close').focus();
    }

    function closeAnnouncement() {
        const modal = document.getElementById('public-modal');
        if (modal.hidden) return;
        modal.hidden = true;
        if (modalReturnFocus) modalReturnFocus.focus();
    }

    function toggleMenu() {
        const nav = document.getElementById('public-nav');
        const open = nav.classList.toggle('open');
        const button = document.getElementById('public-menu-button');
        button.setAttribute('aria-expanded',String(open));
        button.setAttribute('aria-label',open ? 'Close site navigation' : 'Open site navigation');
    }

    function closeMenu() {
        document.getElementById('public-nav').classList.remove('open');
        document.getElementById('public-menu-button').setAttribute('aria-expanded','false');
        document.getElementById('public-menu-button').setAttribute('aria-label','Open site navigation');
    }

    function toast(message) {
        const region = document.getElementById('public-toast');
        const item = document.createElement('div');
        item.className = 'toast';
        item.textContent = message;
        region.appendChild(item);
        setTimeout(() => item.remove(),3500);
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
    }

    function escapeAttr(value) {
        return escapeHtml(value);
    }
})();
