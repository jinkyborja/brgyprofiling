const rolePages = {
    resident: [
        ['OVERVIEW', [['dashboard', 'Gauge', 'Dashboard']]],
        ['MY BARANGAY', [['profile', 'User', 'Resident profile'], ['household', 'Household', 'Household information']]],
        ['SERVICES', [['request-service', 'FilePlus', 'Document requests'], ['my-requests', 'Files', 'My requests'], ['request-details', 'FileText', 'Request details'], ['announcements', 'Bullhorn', 'Announcements'], ['concerns', 'MessageCircleWarning', 'Report a concern'], ['notifications', 'Bell', 'Notifications']]],
        ['ACCOUNT', [['settings', 'SlidersHorizontal', 'Account settings']]]
    ],
    staff: [
        ['OVERVIEW', [['dashboard', 'Gauge', 'Dashboard']]],
        ['RECORDS', [['resident-records', 'Users', 'Resident records'], ['household-records', 'Household', 'Household records'], ['verification', 'BadgeCheck', 'Resident verification']]],
        ['SERVICE DESK', [['assigned-requests', 'Files', 'Assigned requests'], ['concerns', 'MessageCircleWarning', 'Concerns & complaints']]],
        ['COMMUNITY', [['announcements', 'Bullhorn', 'Announcements'], ['messages', 'MessagesSquare', 'Messages'], ['activity', 'History', 'Activity history']]]
    ],
    admin: [
        ['OVERVIEW', [['dashboard', 'Gauge', 'Dashboard']]],
        ['REGISTRY', [['residents', 'Users', 'Resident management'], ['households', 'Household', 'Household management'], ['staff', 'UserCog', 'Staff management']]],
        ['SERVICE MANAGEMENT', [['documents', 'FileText', 'Document management'], ['requests', 'Files', 'All requests'], ['concerns', 'MessageCircleWarning', 'Concerns & complaints']]],
        ['COMMUNITY & OVERSIGHT', [['announcements', 'Bullhorn', 'Announcements'], ['reports', 'ChartNoAxesCombined', 'Reports & analytics'], ['audit', 'ClipboardList', 'Audit logs'], ['settings', 'SlidersHorizontal', 'System settings']]]
    ]
};

const pageInfo = {
    dashboard: ['OVERVIEW', 'Dashboard', 'A practical snapshot of your barangay workspace.'],
    profile: ['MY BARANGAY', 'Resident profile', 'Review the sample resident information in this prototype.'],
    household: ['MY BARANGAY', 'Household information', 'Household members and address information.'],
    'request-service': ['SERVICES', 'Document requests', 'Choose a service and follow the request steps.'],
    'my-requests': ['SERVICES', 'My requests', 'Track sample request status and release instructions.'],
    'request-details': ['SERVICES', 'Request details', 'Review the sample request timeline and release instructions.'],
    announcements: ['COMMUNITY', 'Announcements', 'Notices and service updates from the barangay.'],
    concerns: ['SERVICE DESK', 'Concerns & complaints', 'Submit and follow up on sample community concerns.'],
    notifications: ['SERVICES', 'Notifications', 'Recent sample updates for your account.'],
    settings: ['ACCOUNT', 'Account settings', 'Manage your sample account preferences.'],
    'resident-records': ['RECORDS', 'Resident records', 'Search the sample resident directory.'],
    'household-records': ['RECORDS', 'Household records', 'Browse sample household records.'],
    'assigned-requests': ['SERVICE DESK', 'Assigned requests', 'Review and process requests assigned in this demo.'],
    verification: ['RECORDS', 'Resident verification', 'Review sample resident verification tasks.'],
    messages: ['COMMUNITY', 'Messages', 'A sample inbox for barangay communications.'],
    activity: ['COMMUNITY', 'Activity history', 'Sample operational activity for interface review.'],
    residents: ['REGISTRY', 'Resident management', 'Search and review sample resident records.'],
    households: ['REGISTRY', 'Household management', 'Manage sample household records.'],
    documents: ['SERVICE MANAGEMENT', 'Document management', 'Review the sample list of document services.'],
    requests: ['SERVICE MANAGEMENT', 'All requests', 'Monitor sample document requests and their workflow.'],
    staff: ['REGISTRY', 'Staff management', 'Review sample staff accounts and assignment status.'],
    reports: ['COMMUNITY & OVERSIGHT', 'Reports & analytics', 'Illustrative summary cards; no live reporting data is connected.'],
    audit: ['COMMUNITY & OVERSIGHT', 'Audit logs', 'Sample audit events for design review only.']
};

const sampleData = {
    requests: [
        {id:'REQ-DEMO-018', resident:'Sample Resident A', assignedTo:'Sample Staff A', document:'Barangay Clearance', submitted:'Nov 06, 2026', status:'Ready for release'},
        {id:'REQ-DEMO-017', resident:'Sample Resident B', assignedTo:'Sample Staff A', document:'Certificate of Residency', submitted:'Nov 06, 2026', status:'For staff review'},
        {id:'REQ-DEMO-016', resident:'Sample Resident C', assignedTo:'Sample Staff B', document:'Certificate of Indigency', submitted:'Nov 05, 2026', status:'Correction required'},
        {id:'REQ-DEMO-015', resident:'Sample Resident D', assignedTo:'Sample Staff A', document:'Barangay Clearance', submitted:'Nov 04, 2026', status:'Approved'},
        {id:'REQ-DEMO-014', resident:'Sample Resident E', assignedTo:'Sample Staff B', document:'Business Clearance', submitted:'Nov 03, 2026', status:'Rejected'},
        {id:'REQ-DEMO-013', resident:'Sample Resident F', assignedTo:'Sample Staff B', document:'Certificate of Residency', submitted:'Nov 02, 2026', status:'Released'},
        {id:'REQ-DEMO-012', resident:'Sample Resident G', assignedTo:'Sample Staff A', document:'Certificate of Indigency', submitted:'Nov 01, 2026', status:'Submitted'},
        {id:'REQ-DEMO-011', resident:'Sample Resident A', assignedTo:'Sample Staff A', document:'Certificate of Residency', submitted:'Oct 30, 2026', status:'Released'}
    ],
    residents: [
        {id:'RES-DEMO-008', name:'Sample Resident A', household:'HH-DEMO-041', purok:'Purok 2', verification:'Verified'},
        {id:'RES-DEMO-007', name:'Sample Resident B', household:'HH-DEMO-038', purok:'Purok 1', verification:'Pending review'},
        {id:'RES-DEMO-006', name:'Sample Resident C', household:'HH-DEMO-035', purok:'Purok 3', verification:'Needs information'},
        {id:'RES-DEMO-005', name:'Sample Resident D', household:'HH-DEMO-029', purok:'Purok 2', verification:'Verified'},
        {id:'RES-DEMO-004', name:'Sample Resident E', household:'HH-DEMO-024', purok:'Purok 4', verification:'Verified'},
        {id:'RES-DEMO-003', name:'Sample Resident F', household:'HH-DEMO-019', purok:'Purok 1', verification:'Pending review'}
    ],
    households: [
        {id:'HH-DEMO-041', head:'Sample Resident A', address:'Sample Street 12', members:'4', purok:'Purok 2'},
        {id:'HH-DEMO-038', head:'Sample Resident B', address:'Sample Avenue 8', members:'5', purok:'Purok 1'},
        {id:'HH-DEMO-035', head:'Sample Resident C', address:'Sample Road 41', members:'3', purok:'Purok 3'},
        {id:'HH-DEMO-029', head:'Sample Resident D', address:'Sample Street 19', members:'6', purok:'Purok 2'},
        {id:'HH-DEMO-024', head:'Sample Resident E', address:'Sample Avenue 6', members:'2', purok:'Purok 4'}
    ],
    staff: [
        {id:'STF-DEMO-001', name:'Sample Staff A', assignment:'Document desk', access:'Requests, residents', status:'Active'},
        {id:'STF-DEMO-002', name:'Sample Staff B', assignment:'Community support', access:'Concerns, announcements', status:'Active'},
        {id:'STF-DEMO-003', name:'Sample Staff C', assignment:'Records review', access:'Residents, households', status:'Pending approval'},
        {id:'STF-DEMO-004', name:'Sample Staff D', assignment:'Front desk', access:'Requests', status:'Inactive'}
    ],
    concerns: [
        {id:'CON-DEMO-091', subject:'Streetlight out near the covered court', resident:'Sample Resident A · HH-DEMO-041', received:'Nov 06, 2026', status:'Assigned'},
        {id:'CON-DEMO-090', subject:'Drainage clearing request', resident:'Sample Resident D · HH-DEMO-029', received:'Nov 05, 2026', status:'Under review'},
        {id:'CON-DEMO-089', subject:'Noise concern', resident:'Sample Resident B · HH-DEMO-038', received:'Nov 03, 2026', status:'Resolved'},
        {id:'CON-DEMO-088', subject:'Request for waste collection schedule', resident:'Sample Resident C · HH-DEMO-035', received:'Nov 01, 2026', status:'Received'}
    ],
    announcements: [
        {id:'ANN-031', subject:'Community clean-up — Saturday, 7:00 AM', audience:'All residents', published:'Nov 06, 2026', status:'Published'},
        {id:'ANN-030', subject:'Updated document counter hours', audience:'All residents', published:'Nov 04, 2026', status:'Published'},
        {id:'ANN-029', subject:'Water service interruption notice', audience:'Purok 3', published:'Nov 02, 2026', status:'Published'},
        {id:'ANN-028', subject:'Youth council registration', audience:'Residents 15–24', published:'Oct 29, 2026', status:'Draft'}
    ],
    documents: [
        {id:'DOC-01', document:'Barangay Clearance', requirements:'Valid ID; purpose', fee:'Set by barangay', availability:'Available'},
        {id:'DOC-02', document:'Certificate of Residency', requirements:'Proof of residence; valid ID', fee:'Set by barangay', availability:'Available'},
        {id:'DOC-03', document:'Certificate of Indigency', requirements:'Valid ID; supporting details', fee:'Set by barangay', availability:'Available'},
        {id:'DOC-04', document:'Business Clearance', requirements:'Business details; valid ID', fee:'Set by barangay', availability:'Under review'}
    ],
    messages: [
        {id:'MSG-032', sender:'Barangay Service Desk', subject:'Your request needs one correction', received:'Today, 9:42 AM', status:'Unread'},
        {id:'MSG-031', sender:'Community Office', subject:'Clean-up drive reminder', received:'Yesterday, 3:10 PM', status:'Read'},
        {id:'MSG-030', sender:'Records Desk', subject:'Verification update', received:'Nov 05, 2026', status:'Read'}
    ],
    activity: [
        {id:'ACT-109', event:'Request moved to “Ready for release”', actor:'Document desk', occurred:'Today, 10:15 AM', status:'Complete'},
        {id:'ACT-108', event:'Concern assigned for action', actor:'Community support', occurred:'Today, 9:50 AM', status:'Complete'},
        {id:'ACT-107', event:'Resident record marked for review', actor:'Records review', occurred:'Yesterday, 4:32 PM', status:'Complete'}
    ],
    audit: [
        {id:'AUD-501', event:'Request status updated', actor:'Demo staff account', occurred:'Today, 10:15 AM', category:'Request'},
        {id:'AUD-500', event:'Concern assigned', actor:'Demo staff account', occurred:'Today, 9:50 AM', category:'Concern'},
        {id:'AUD-499', event:'Announcement published', actor:'Demo admin account', occurred:'Nov 06, 2026', category:'Content'}
    ]
};

const roleNames = {resident:'Resident', staff:'Staff', admin:'Administrator'};
const roleAvatars = {resident:'RS', staff:'ST', admin:'AD'};
let activeRole = 'admin';
let activePage = 'dashboard';
let currentPageNumber = 1;
const pageSize = 5;
let requestStep = 1;
let requestDraft = {};
let pendingFocus = null;
let selectedRequestId = 'REQ-24018';

const icons = {
    Gauge:'fa-gauge-high', User:'fa-user', Household:'fa-house', FilePlus:'fa-file-circle-plus',
    Files:'fa-folder-open', Bullhorn:'fa-bullhorn', MessageCircleWarning:'fa-triangle-exclamation',
    Bell:'fa-bell', SlidersHorizontal:'fa-sliders', Users:'fa-users', BadgeCheck:'fa-circle-check',
    MessagesSquare:'fa-comments', History:'fa-clock-rotate-left', UserCog:'fa-user-gear',
    FileText:'fa-file-lines', ChartNoAxesCombined:'fa-chart-column', ClipboardList:'fa-clipboard-list',
    Eye:'fa-eye', ArrowRight:'fa-arrow-right', Download:'fa-download', Plus:'fa-plus',
    Calendar:'fa-calendar', Search:'fa-magnifying-glass', Check:'fa-check', Info:'fa-circle-info'
};
const icon = name => '<i class="fa-solid ' + (icons[name] || 'fa-circle') + '" aria-hidden="true"></i>';
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

document.addEventListener('DOMContentLoaded', initialize);

function initialize() {
    if (!isLocalPreviewHost()) {
        document.body.innerHTML = '<main class="preview-blocked"><h1>Local preview only</h1><p>This mock portal is available only from a local file or localhost development server. Open the project locally; production authorization is not provided here.</p></main>';
        return;
    }
    const route = readPreviewRoute();
    activeRole = route.role;
    activePage = route.page;
    document.getElementById('role-select').value = activeRole;
    updateProfileChip();
    renderNavigation();
    renderPage();
    document.getElementById('role-select').addEventListener('change', event => {
        activeRole = event.target.value;
        activePage = 'dashboard';
        updateProfileChip();
        syncPreviewRoute();
        renderNavigation();
        renderPage();
        closeMobileNavigation();
    });
    document.querySelector('.brand').addEventListener('click', event => {
        event.preventDefault();
        activePage = 'dashboard';
        currentPageNumber = 1;
        syncPreviewRoute();
        renderNavigation();
        renderPage();
    });
    document.getElementById('side-navigation').addEventListener('click', event => {
        const button = event.target.closest('[data-page]');
        if (!button) return;
        activePage = button.dataset.page;
        currentPageNumber = 1;
        syncPreviewRoute();
        renderPage();
        renderNavigation();
        closeMobileNavigation();
    });
    document.getElementById('page-content').addEventListener('click', handleContentClick);
    document.getElementById('heading-actions').addEventListener('click', handleContentClick);
    document.getElementById('modal-content').addEventListener('click', handleModalContentClick);
    document.getElementById('modal-content').addEventListener('submit', handleModalSubmit);
    document.getElementById('page-content').addEventListener('input', handleTableInput);
    document.getElementById('page-content').addEventListener('change', handleTableInput);
    document.getElementById('page-content').addEventListener('submit', handlePrototypeFormSubmit);
    document.getElementById('mobile-menu').addEventListener('click', toggleMobileNavigation);
    document.getElementById('sidebar-scrim').addEventListener('click', closeMobileNavigation);
    document.getElementById('collapse-menu').addEventListener('click', toggleCollapsedNavigation);
    document.getElementById('notification-button').addEventListener('click', toggleNotifications);
    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-backdrop').addEventListener('click', event => {
        if (event.target.id === 'modal-backdrop') closeModal();
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            closeModal();
            closeMobileNavigation();
            closeNotifications();
            return;
        }
        if (event.key === 'Tab' && !document.getElementById('modal-backdrop').hidden) {
            const focusable = [...document.querySelectorAll('#modal-card button:not(:disabled), #modal-card input:not(:disabled), #modal-card select:not(:disabled), #modal-card textarea:not(:disabled), #modal-card [href]')].filter(element => element.offsetParent !== null);
            if (!focusable.length) return;
            if (event.shiftKey && document.activeElement === focusable[0]) {
                event.preventDefault();
                focusable[focusable.length - 1].focus();
            } else if (!event.shiftKey && document.activeElement === focusable[focusable.length - 1]) {
                event.preventDefault();
                focusable[0].focus();
            }
        }
    });
    window.addEventListener('popstate', () => {
        const route = readPreviewRoute();
        activeRole = route.role;
        activePage = route.page;
        document.getElementById('role-select').value = activeRole;
        updateProfileChip();
        renderNavigation();
        renderPage();
    });
    document.addEventListener('click', event => {
        const dropdown = document.querySelector('.dropdown-wrap');
        if (dropdown && !dropdown.contains(event.target)) closeNotifications();
    });
    document.querySelectorAll('[data-open-auth]').forEach(button => button.addEventListener('click', openAuthStates));
}

function isLocalPreviewHost() {
    return location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
}

function readPreviewRoute() {
    const params = new URLSearchParams(location.search);
    const requestedRole = params.get('role');
    const role = Object.prototype.hasOwnProperty.call(rolePages, requestedRole) ? requestedRole : 'admin';
    const requestedPage = params.get('page');
    const availablePages = rolePages[role].flatMap(([, pages]) => pages.map(([page]) => page));
    const page = availablePages.includes(requestedPage) ? requestedPage : 'dashboard';
    const requestId = params.get('id');
    if (page === 'request-details' && sampleData.requests.some(item => item.id === requestId)) selectedRequestId = requestId;
    return {role, page};
}

function syncPreviewRoute() {
    const url = new URL(location.href);
    url.searchParams.set('role', activeRole);
    url.searchParams.set('page', activePage);
    if (activePage === 'request-details') url.searchParams.set('id', selectedRequestId);
    else url.searchParams.delete('id');
    history.pushState({role:activeRole,page:activePage}, '', url);
}

function updateProfileChip() {
    document.getElementById('profile-role').textContent = roleNames[activeRole];
    document.getElementById('profile-avatar').textContent = roleAvatars[activeRole];
    document.getElementById('profile-name').textContent = activeRole === 'admin' ? 'Admin Demo' : activeRole === 'staff' ? 'Staff Demo' : 'Resident Demo';
}

function handlePrototypeFormSubmit(event) {
    const form = event.target.closest('[data-prototype-form]');
    if (!form) return;
    event.preventDefault();
    if (!form.reportValidity()) return;
    toast('Settings validated in this prototype. Nothing was saved or sent.');
}

function renderNavigation() {
    const navigation = document.getElementById('side-navigation');
    navigation.innerHTML = rolePages[activeRole].map(([heading, pages]) =>
        '<div class="nav-section-title">' + escapeHtml(heading) + '</div>' +
        pages.map(([page, symbol, label]) =>
            '<button type="button" class="nav-item' + (page === activePage ? ' active' : '') + '" data-page="' + page + '"' +
            (page === activePage ? ' aria-current="page"' : '') + ' title="' + escapeHtml(label) + '">' +
            icon(symbol) + '<span class="nav-text">' + escapeHtml(label) + '</span></button>'
        ).join('')
    ).join('');
}

function renderPage() {
    const info = activePage === 'settings' && activeRole === 'admin'
        ? ['SYSTEM', 'System settings', 'Preview system-wide settings; changes stay local to this prototype.']
        : pageInfo[activePage] || pageInfo.dashboard;
    document.getElementById('page-eyebrow').textContent = info[0];
    document.getElementById('page-title').textContent = info[1];
    document.getElementById('page-description').textContent = info[2];
    document.getElementById('breadcrumb-current').textContent = info[1];
    document.getElementById('heading-actions').innerHTML = headingActions();
    const content = document.getElementById('page-content');
    if (activePage === 'dashboard') content.innerHTML = renderDashboard();
    else if (activePage === 'request-service') content.innerHTML = renderServices();
    else if (activePage === 'request-details') content.innerHTML = renderRequestDetails();
    else if (activePage === 'my-requests' || activePage === 'assigned-requests' || activePage === 'requests') content.innerHTML = renderTable('requests');
    else if (activePage === 'residents' || activePage === 'resident-records' || activePage === 'verification') content.innerHTML = renderTable('residents');
    else if (activePage === 'households' || activePage === 'household-records' || activePage === 'household') content.innerHTML = renderTable('households');
    else if (activePage === 'staff') content.innerHTML = renderTable('staff');
    else if (activePage === 'documents') content.innerHTML = renderTable('documents');
    else if (activePage === 'concerns') content.innerHTML = renderTable('concerns');
    else if (activePage === 'announcements') content.innerHTML = renderAnnouncements();
    else if (activePage === 'notifications') content.innerHTML = renderNotifications();
    else if (activePage === 'messages') content.innerHTML = renderTable('messages');
    else if (activePage === 'activity') content.innerHTML = renderTable('activity');
    else if (activePage === 'audit') content.innerHTML = renderTable('audit');
    else if (activePage === 'reports') content.innerHTML = renderReports();
    else if (activePage === 'profile') content.innerHTML = renderProfile();
    else if (activePage === 'settings') content.innerHTML = renderSettings();
    else content.innerHTML = renderEmptyPage();
    if (tableTypeForPage()) updateTable();
}

function headingActions() {
    if (activeRole === 'resident' && ['dashboard', 'request-service', 'my-requests'].includes(activePage))
        return '<div class="heading-buttons"><button class="button button-primary" type="button" data-action="new-request">' + icon('Plus') + ' New request</button></div>';
    if (activeRole === 'resident' && activePage === 'concerns')
        return '<div class="heading-buttons"><button class="button button-primary" type="button" data-action="new-concern">' + icon('Plus') + ' Report concern</button></div>';
    if (activeRole === 'staff' && activePage === 'announcements')
        return '<div class="heading-buttons"><button class="button button-primary" type="button" data-action="new-announcement">' + icon('Plus') + ' Draft announcement</button></div>';
    if (activeRole === 'admin' && ['announcements', 'documents'].includes(activePage))
        return '<div class="heading-buttons"><button class="button button-primary" type="button" data-action="' + (activePage === 'announcements' ? 'new-announcement' : 'new-document') + '">' + icon('Plus') + ' Create new</button></div>';
    return '';
}

function dashboardMetrics() {
    if (activeRole === 'resident') return [
        ['Active requests','2','1 ready for release','Files'], ['Household members','4','Sample household HH-0241','Household'],
        ['Unread updates','2','Mock notifications','Bell'], ['Open concerns','1','Sample concern in review','MessageCircleWarning']
    ];
    if (activeRole === 'staff') return [
        ['Assigned requests','8','Illustrative queue','Files'], ['Verification tasks','3','Illustrative worklist','BadgeCheck'],
        ['Open concerns','4','Illustrative worklist','MessageCircleWarning'], ['Processed today','6','Illustrative activity','Check']
    ];
    return [
        ['Verified residents','1,248','Sample metric only','Users'], ['Households','356','Sample metric only','Household'],
        ['Requests in progress','18','Sample metric only','Files'], ['Active staff','12','Sample metric only','UserCog']
    ];
}

function renderDashboard() {
    const metrics = dashboardMetrics().map(([label, value, note, symbol]) =>
        '<article class="stat-card"><div class="stat-top"><span>' + escapeHtml(label) + '</span><span class="stat-icon">' + icon(symbol) + '</span></div><strong class="stat-value">' + escapeHtml(value) + '</strong><div class="stat-foot">' + escapeHtml(note) + '</div></article>'
    ).join('');
    const actions = activeRole === 'resident'
        ? [['request-service','FilePlus','Request a document'],['my-requests','Files','Track my requests'],['concerns','MessageCircleWarning','Report a concern'],['announcements','Bullhorn','View announcements']]
        : activeRole === 'staff'
            ? [['assigned-requests','Files','Review requests'],['verification','BadgeCheck','Verify residents'],['concerns','MessageCircleWarning','Review concerns'],['resident-records','Users','Resident records']]
            : [['residents','Users','Residents'],['requests','Files','All requests'],['staff','UserCog','Staff management'],['reports','ChartNoAxesCombined','View reports']];
    const actionHtml = actions.map(([page, symbol, label]) =>
        '<button class="quick-action" type="button" data-go="' + page + '">' + icon(symbol) + '<span>' + escapeHtml(label) + '</span></button>'
    ).join('');
    const recent = activeRole === 'resident' ? sampleData.requests.slice(0,3) : sampleData.requests.slice(0,4);
    const recentHtml = recent.map(item =>
        '<div class="activity-row"><span class="activity-symbol">' + icon('Files') + '</span><div class="row-copy"><strong>' + escapeHtml(activeRole === 'resident' ? item.document : item.id + ' · ' + item.document) + '</strong><small>' + escapeHtml(item.submitted) + '</small></div>' + statusBadge(item.status) + '</div>'
    ).join('');
    const sideContent = activeRole === 'resident'
        ? '<div class="panel"><div class="panel-heading"><div><h2>Latest announcement</h2><p>Sample community notice</p></div></div><div class="announcement-row"><span class="activity-symbol">' + icon('Bullhorn') + '</span><div class="row-copy"><strong>Community clean-up — Saturday</strong><small>Meeting point: barangay covered court · 7:00 AM</small></div></div><button class="button button-secondary" type="button" data-go="announcements">All announcements</button></div>'
        : activeRole === 'staff'
            ? '<div class="panel"><div class="panel-heading"><div><h2>Today’s worklist</h2><p>Prioritized sample tasks</p></div></div>' + sampleData.concerns.slice(0,2).map(item => '<div class="activity-row"><span class="activity-symbol">' + icon('MessageCircleWarning') + '</span><div class="row-copy"><strong>' + escapeHtml(item.subject) + '</strong><small>' + escapeHtml(item.received) + '</small></div>' + statusBadge(item.status) + '</div>').join('') + '</div>'
            : '<div class="panel"><div class="panel-heading"><div><h2>Requests by status</h2><p>Illustrative queue distribution</p></div></div>' + [['For review','7'],['Correction required','3'],['Ready for release','5']].map(([label,value]) => '<div class="request-row"><div class="row-copy"><strong>' + label + '</strong><small>Sample queue</small></div><span class="status">' + value + '</span></div>').join('') + '<button class="button button-secondary" type="button" data-go="requests">Open all requests</button></div>';
    return '<div class="stat-grid">' + metrics + '</div><div class="dashboard-grid"><div class="panel"><div class="panel-heading"><div><h2>' + (activeRole === 'resident' ? 'Request progress' : activeRole === 'staff' ? 'Assigned request queue' : 'Recent requests') + '</h2><p>Sample data for interface review</p></div><button class="button button-secondary" type="button" data-go="' + (activeRole === 'resident' ? 'my-requests' : activeRole === 'staff' ? 'assigned-requests' : 'requests') + '">View all</button></div><div class="activity-list">' + recentHtml + '</div></div><div>' + sideContent + '</div></div><div class="panel"><div class="panel-heading"><div><h2>Quick actions</h2><p>Common tasks for the ' + roleNames[activeRole].toLowerCase() + ' workspace</p></div></div><div class="quick-grid">' + actionHtml + '</div></div>';
}

function renderTable(type) {
    const definitions = {
        requests: {title:activeRole === 'resident' ? 'Your requests' : activeRole === 'staff' ? 'Assigned request queue' : 'Request register', search:'Search ID, resident, or document', status:true, columns:[['id','Request ID'],['resident','Resident'],...(activeRole === 'staff' ? [['assignedTo','Assigned to']] : []),['document','Document'],['submitted','Submitted'],['status','Status']]},
        residents: {title:'Resident directory', search:'Search resident, ID, household', status:true, columns:[['id','Resident ID'],['name','Resident'],['household','Household'],['purok','Area'],['verification','Verification']]},
        households: {title:'Household register', search:'Search household, name, or address', status:false, columns:[['id','Household ID'],['head','Household head'],['address','Address'],['members','Members'],['purok','Area']]},
        staff: {title:'Staff directory', search:'Search staff, assignment, or ID', status:true, columns:[['id','Staff ID'],['name','Staff member'],['assignment','Assignment'],['access','Sample access'],['status','Account status']]},
        documents: {title:'Available document services', search:'Search document or requirement', status:true, columns:[['id','Code'],['document','Document'],['requirements','Requirements'],['fee','Fee'],['availability','Availability']]},
        concerns: {title:'Concern register', search:'Search reference, subject, or resident', status:true, columns:[['id','Reference'],['subject','Concern'],['resident','Reported by'],['received','Received'],['status','Status']]},
        messages: {title:'Inbox', search:'Search sender or subject', status:true, columns:[['id','Reference'],['sender','From'],['subject','Subject'],['received','Received'],['status','Read status']]},
        activity: {title:'Recent activities', search:'Search event or actor', status:false, columns:[['id','Reference'],['event','Activity'],['actor','Account'],['occurred','Time'],['status','Result']]},
        audit: {title:'Audit event register', search:'Search event, account, or category', status:false, columns:[['id','Reference'],['event','Event'],['actor','Actor'],['occurred','Time'],['category','Category']]}
    };
    const definition = definitions[type];
    const rows = sampleData[type] || [];
    return '<div class="panel"><div class="panel-heading"><div><h2>' + escapeHtml(definition.title) + '</h2><p>Sample records only · ' + rows.length + ' example rows</p></div></div><div class="toolbar"><div class="toolbar-start"><label class="search-field">' + icon('Search') + '<span class="sr-only">Search records</span><input type="search" data-table-search placeholder="' + escapeHtml(definition.search) + '"></label>' + (definition.status ? '<label><span class="sr-only">Filter by status</span><select class="filter-select" data-status-filter><option value="">All statuses</option>' + [...new Set(rows.map(row => row.status || row.verification || row.availability))].map(status => '<option>' + escapeHtml(status) + '</option>').join('') + '</select></label>' : '') + '</div><div class="toolbar-end"><button class="button button-secondary" type="button" data-action="export-preview">' + icon('Download') + ' Export preview</button></div></div><div class="table-wrap"><table class="data-table"><thead><tr>' + definition.columns.map(([,label]) => '<th scope="col">' + escapeHtml(label) + '</th>').join('') + '<th scope="col">Action</th></tr></thead><tbody data-table-body>' + tableRows(rows, definition.columns) + '</tbody></table></div><div class="table-footer"><span data-result-count></span><nav class="pagination" aria-label="Table pages" data-pagination></nav></div></div>';
}

function tableRows(rows, columns) {
    if (!rows.length) return '<tr><td class="table-empty" colspan="' + (columns.length + 1) + '">No matching sample records.</td></tr>';
    return rows.map(row => {
        const extra = row.status !== 'Released' && row.status !== 'Cancelled' && row.status !== 'Rejected'
            ? activeRole === 'resident' && activePage === 'my-requests'
                ? '<button class="table-action" type="button" data-cancel-record="' + escapeHtml(row.id) + '">Cancel</button>'
                : activeRole !== 'resident' && ['requests','assigned-requests'].includes(activePage)
                    ? '<button class="table-action" type="button" data-update-record="' + escapeHtml(row.id) + '">Update status</button>'
                    : ''
            : '';
        return '<tr>' + columns.map(([key]) => '<td>' + (key === 'status' || key === 'verification' || key === 'availability' ? statusBadge(row[key]) : escapeHtml(row[key])) + '</td>').join('') + '<td><div class="inline-actions"><button class="table-action" type="button" data-view-record="' + escapeHtml(row.id) + '">' + icon('Eye') + ' View</button>' + extra + '</div></td></tr>';
    }).join('');
}

function statusBadge(value) {
    const normalized = String(value || '').toLowerCase();
    const color = /ready|release|approved|verified|resolved|published|active|complete|available|read$/.test(normalized) ? ' status-green'
        : /reject|correction|needs information|inactive/.test(normalized) ? ' status-red'
            : /pending|review|submitted|assigned|received|unread|draft|under review|approval/.test(normalized) ? ' status-amber' : ' status-neutral';
    return '<span class="status' + color + '">' + escapeHtml(value) + '</span>';
}

function renderServices() {
    const services = sampleData.documents.filter(item => item.availability === 'Available');
    return '<div class="panel"><div class="panel-heading"><div><h2>Select a document</h2><p>Requirements and fees in this preview are examples. Confirm actual requirements with the barangay.</p></div></div><div class="service-grid">' + services.map(item => '<button class="service-card" type="button" data-request-document="' + escapeHtml(item.document) + '">' + icon('FileText') + '<strong>' + escapeHtml(item.document) + '</strong><small>' + escapeHtml(item.requirements) + '</small><small>Fee: ' + escapeHtml(item.fee) + '</small></button>').join('') + '</div></div><div class="panel"><div class="panel-heading"><div><h2>Request process</h2><p>A guided sequence with review before submitting.</p></div></div><ol class="stepper"><li class="done"><span class="step-index">1</span>Select</li><li><span class="step-index">2</span>Details</li><li><span class="step-index">3</span>Review</li><li><span class="step-index">4</span>Track</li></ol><p class="field-hint">This prototype does not submit or store real document requests.</p></div>';
}

function renderAnnouncements() {
    const items = sampleData.announcements;
    return '<div class="panel"><div class="panel-heading"><div><h2>Barangay notices</h2><p>Illustrative announcements · published status shown for design only</p></div></div><div class="announcement-list">' + items.map(item => '<article class="announcement-row"><span class="activity-symbol">' + icon('Bullhorn') + '</span><div class="row-copy"><strong>' + escapeHtml(item.subject) + '</strong><small>' + escapeHtml(item.audience) + ' · ' + escapeHtml(item.published) + '</small></div>' + statusBadge(item.status) + '</article>').join('') + '</div></div>';
}

function renderNotifications() {
    return '<div class="panel"><div class="panel-heading"><div><h2>Recent notifications</h2><p>Sample notification states, not actual alerts.</p></div></div><div class="activity-list"><div class="activity-row"><span class="activity-symbol">' + icon('Files') + '</span><div class="row-copy"><strong>Document request ready for release</strong><small>Today, 10:15 AM · Sample request REQ-24018</small></div>' + statusBadge('Unread') + '</div><div class="activity-row"><span class="activity-symbol">' + icon('Bullhorn') + '</span><div class="row-copy"><strong>New barangay announcement</strong><small>Yesterday · Community clean-up notice</small></div>' + statusBadge('Unread') + '</div><div class="activity-row"><span class="activity-symbol">' + icon('Check') + '</span><div class="row-copy"><strong>Profile verification complete</strong><small>Nov 04, 2026 · Sample account</small></div>' + statusBadge('Read') + '</div></div></div>';
}

function renderReports() {
    return '<div class="stat-grid">' + [['Requests received','142'],['Released','96'],['Concerns resolved','28'],['Median turnaround','2.4 days']].map(([label,value]) => '<article class="stat-card"><div class="stat-top"><span>' + label + '</span><span class="stat-icon">' + icon('ChartNoAxesCombined') + '</span></div><strong class="stat-value">' + value + '</strong><div class="stat-foot">Illustrative sample metric</div></article>').join('') + '</div><div class="panel"><div class="panel-heading"><div><h2>Report preview</h2><p>Example summary only — not connected to a database.</p></div><button class="button button-secondary" type="button" data-action="export-preview">' + icon('Download') + ' Export preview</button></div><div class="empty-card">' + icon('ChartNoAxesCombined') + '<strong>Analytics view placeholder</strong>Live trends require approved database metrics and reporting rules.</div></div>';
}

function renderProfile() {
    return '<div class="panel"><div class="panel-heading"><div><h2>Resident profile</h2><p>Sample profile fields — sensitive details intentionally omitted.</p></div><button class="button button-secondary" type="button" data-action="edit-profile">Edit sample profile</button></div><dl class="review-list"><div><dt>Name</dt><dd>Sample Resident A</dd></div><div><dt>Resident reference</dt><dd>RES-DEMO-008</dd></div><div><dt>Household</dt><dd>HH-DEMO-041</dd></div><div><dt>Verification</dt><dd>' + statusBadge('Verified') + '</dd></div></dl></div><div class="panel"><div class="panel-heading"><div><h2>Household</h2><p>Household details are available to the resident in this example.</p></div><button class="button button-secondary" type="button" data-go="household">View household</button></div></div>';
}

function renderRequestDetails() {
    const request = sampleData.requests.find(item => item.id === selectedRequestId) || sampleData.requests[0];
    const timeline = ['Submitted', 'For staff review', 'Correction required', 'Approved', 'Ready for release', 'Released'];
    const currentIndex = timeline.indexOf(request.status);
    const history = timeline.slice(0, Math.max(currentIndex + 1, 1));
    return '<div class="panel"><div class="panel-heading"><div><h2>' + escapeHtml(request.document) + '</h2><p>Sample reference ' + escapeHtml(request.id) + ' · submitted ' + escapeHtml(request.submitted) + '</p></div>' + statusBadge(request.status) + '</div><dl class="review-list"><div><dt>Request reference</dt><dd>' + escapeHtml(request.id) + '</dd></div><div><dt>Document</dt><dd>' + escapeHtml(request.document) + '</dd></div><div><dt>Current status</dt><dd>' + statusBadge(request.status) + '</dd></div><div><dt>Release instructions</dt><dd>' + (request.status === 'Ready for release' ? 'Bring valid identification to the barangay service counter. Confirm current hours and fees before visiting.' : 'Instructions will be shown when the request is ready for release.') + '</dd></div></dl><h3>Request history</h3><ol class="request-history">' + history.map((status, index) => '<li class="' + (index === history.length - 1 ? 'current' : 'done') + '"><strong>' + escapeHtml(status) + '</strong><small>' + (index === 0 ? escapeHtml(request.submitted) : 'Illustrative workflow step') + '</small></li>').join('') + '</ol><div class="panel-actions"><button class="button button-secondary" type="button" data-go="my-requests">Back to my requests</button></div><p class="field-hint">Preview only: this is not a real request and does not reflect an actual resident record.</p></div>';
}

function renderSettings() {
    if (activeRole === 'admin') {
        return '<div class="panel"><div class="panel-heading"><div><h2>System preferences</h2><p>Illustrative values only. Saving does not change the live application.</p></div></div><form data-prototype-form="settings" class="form-grid"><div class="form-field"><label for="setting-name">Barangay name</label><input id="setting-name" value="Barangay San Isidro" required maxlength="100"></div><div class="form-field"><label for="setting-hours">Service counter hours</label><input id="setting-hours" value="Monday–Friday, 8:00 AM–5:00 PM" required maxlength="100"></div><div class="form-field full"><label for="setting-notice">Public service notice</label><textarea id="setting-notice" maxlength="500" placeholder="Optional notice shown to residents"></textarea></div><div class="form-field full"><button class="button button-primary" type="submit">Save preview settings</button></div></form></div>';
    }
    return '<div class="panel"><div class="panel-heading"><div><h2>Account preferences</h2><p>Demo-only settings. Changes are not stored.</p></div></div><form data-prototype-form="settings" class="form-grid"><div class="form-field"><label for="pref-language">Language</label><select id="pref-language"><option>English</option><option>Filipino</option></select></div><div class="form-field"><label for="pref-notifications">Notifications</label><select id="pref-notifications"><option>Email and in-app</option><option>In-app only</option></select></div><div class="form-field full"><button class="button button-primary" type="submit">Save preview preferences</button></div></form></div>';
}

function renderEmptyPage() {
    return '<div class="panel"><div class="empty-card">' + icon('Info') + '<strong>Sample page preview</strong>This section is represented in the role navigation. Backend data and permissions are intentionally not connected.</div></div>';
}

function handleContentClick(event) {
    const goto = event.target.closest('[data-go]');
    if (goto) {
        activePage = goto.dataset.go;
        currentPageNumber = 1;
        syncPreviewRoute();
        renderNavigation();
        renderPage();
        return;
    }
    const action = event.target.closest('[data-action]');
    if (action) {
        const name = action.dataset.action;
        if (name === 'new-request') startRequest();
        else if (name === 'new-concern') openFormModal('Report a concern', 'concern');
        else if (name === 'new-announcement') openFormModal('Draft an announcement', 'announcement');
        else if (name === 'new-document') openFormModal('Add a document service', 'document');
        else if (name === 'edit-profile') openFormModal('Edit sample profile', 'profile');
        else if (name === 'export-preview') toast('Export is a prototype action. No file was created.');
        return;
    }
    const request = event.target.closest('[data-request-document]');
    if (request) {
        requestDraft = {document:request.dataset.requestDocument};
        requestStep = 2;
        renderRequestModal();
        return;
    }
    const view = event.target.closest('[data-view-record]');
    if (view) openRecord(view.dataset.viewRecord);
    const update = event.target.closest('[data-update-record]');
    if (update) updateRequestStatus(update.dataset.updateRecord);
    const cancel = event.target.closest('[data-cancel-record]');
    if (cancel) cancelRequest(cancel.dataset.cancelRecord);
    const pageButton = event.target.closest('[data-page-number]');
    if (pageButton && !pageButton.disabled) {
        currentPageNumber = Number(pageButton.dataset.pageNumber);
        updateTable();
    }
    const modalAction = event.target.closest('[data-modal-action]');
    if (modalAction) handleModalAction(modalAction.dataset.modalAction);
}

function tableTypeForPage() {
    if (['my-requests','assigned-requests','requests'].includes(activePage)) return 'requests';
    if (['residents','resident-records','verification'].includes(activePage)) return 'residents';
    if (['households','household-records','household'].includes(activePage)) return 'households';
    if (activePage === 'staff') return 'staff';
    if (activePage === 'documents') return 'documents';
    if (activePage === 'concerns') return 'concerns';
    if (activePage === 'messages') return 'messages';
    if (activePage === 'activity') return 'activity';
    if (activePage === 'audit') return 'audit';
    return null;
}

function handleTableInput(event) {
    if (!event.target.matches('[data-table-search], [data-status-filter]')) return;
    currentPageNumber = 1;
    updateTable();
}

function updateTable() {
    const type = tableTypeForPage();
    if (!type) return;
    const search = (document.querySelector('[data-table-search]')?.value || '').trim().toLowerCase();
    const status = document.querySelector('[data-status-filter]')?.value || '';
    let scopedRows = sampleData[type];
    if (activePage === 'my-requests') scopedRows = scopedRows.filter(row => row.resident === 'Sample Resident A');
    if (activePage === 'assigned-requests') scopedRows = scopedRows.filter(row => row.assignedTo === 'Sample Staff A');
    const rows = scopedRows.filter(row => {
        const matchesSearch = Object.values(row).some(value => String(value).toLowerCase().includes(search));
        const matchesStatus = !status || [row.status, row.verification, row.availability].includes(status);
        return matchesSearch && matchesStatus;
    });
    const pages = Math.max(1, Math.ceil(rows.length / pageSize));
    currentPageNumber = Math.min(currentPageNumber, pages);
    const columns = getColumns(type);
    const visible = rows.slice((currentPageNumber - 1) * pageSize, currentPageNumber * pageSize);
    document.querySelector('[data-table-body]').innerHTML = tableRows(visible, columns);
    document.querySelector('[data-result-count]').textContent = rows.length ? 'Showing ' + ((currentPageNumber - 1) * pageSize + 1) + '–' + Math.min(currentPageNumber * pageSize, rows.length) + ' of ' + rows.length + ' sample records' : 'No sample records found';
    document.querySelector('[data-pagination]').innerHTML = paginationMarkup(currentPageNumber, pages);
}

function getColumns(type) {
    const map = {
        requests:[['id','Request ID'],['resident','Resident'],...(activeRole === 'staff' ? [['assignedTo','Assigned to']] : []),['document','Document'],['submitted','Submitted'],['status','Status']],
        residents:[['id','Resident ID'],['name','Resident'],['household','Household'],['purok','Area'],['verification','Verification']],
        households:[['id','Household ID'],['head','Household head'],['address','Address'],['members','Members'],['purok','Area']],
        staff:[['id','Staff ID'],['name','Staff member'],['assignment','Assignment'],['access','Sample access'],['status','Account status']],
        documents:[['id','Code'],['document','Document'],['requirements','Requirements'],['fee','Fee'],['availability','Availability']],
        concerns:[['id','Reference'],['subject','Concern'],['resident','Reported by'],['received','Received'],['status','Status']],
        messages:[['id','Reference'],['sender','From'],['subject','Subject'],['received','Received'],['status','Read status']],
        activity:[['id','Reference'],['event','Activity'],['actor','Account'],['occurred','Time'],['status','Result']],
        audit:[['id','Reference'],['event','Event'],['actor','Actor'],['occurred','Time'],['category','Category']]
    };
    return map[type];
}

function paginationMarkup(page, total) {
    if (total <= 1) return '';
    let markup = '<button type="button" data-page-number="' + (page - 1) + '" aria-label="Previous page"' + (page === 1 ? ' disabled' : '') + '>&lsaquo;</button>';
    for (let index = 1; index <= total; index++) markup += '<button type="button" data-page-number="' + index + '"' + (index === page ? ' aria-current="page"' : '') + '>' + index + '</button>';
    return markup + '<button type="button" data-page-number="' + (page + 1) + '" aria-label="Next page"' + (page === total ? ' disabled' : '') + '>&rsaquo;</button>';
}

function openRecord(id) {
    const row = Object.values(sampleData).flat().find(item => item.id === id);
    if (!row) return;
    if (id.startsWith('REQ-') && activeRole === 'resident') {
        selectedRequestId = id;
        activePage = 'request-details';
        currentPageNumber = 1;
        syncPreviewRoute();
        renderNavigation();
        renderPage();
        return;
    }
    document.getElementById('modal-title').textContent = 'Sample record · ' + id;
    document.getElementById('modal-eyebrow').textContent = 'MOCK RECORD';
    document.getElementById('modal-content').innerHTML = '<dl class="review-list">' + Object.entries(row).map(([key,value]) => '<div><dt>' + escapeHtml(key.replace(/_/g,' ')) + '</dt><dd>' + escapeHtml(value) + '</dd></div>').join('') + '</dl><div class="auth-state-message">This record is illustrative prototype data only. It is not a real resident, request, or case file.</div>';
    openModal();
}

function startRequest() {
    activePage = 'request-service';
    syncPreviewRoute();
    renderNavigation();
    renderPage();
    document.getElementById('page-title').scrollIntoView({block:'start',behavior:'smooth'});
}

function renderRequestModal() {
    const title = ['','Select document','Complete request details','Review request','Prototype complete'][requestStep];
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-eyebrow').textContent = 'DOCUMENT REQUEST · DEMO';
    const stepper = '<ol class="stepper">' + ['Select','Details','Review','Track'].map((label,index) => '<li class="' + (index + 1 === requestStep ? 'active' : index + 1 < requestStep ? 'done' : '') + '"><span class="step-index">' + (index + 1 < requestStep ? '✓' : index + 1) + '</span>' + label + '</li>').join('') + '</ol>';
    let body = '';
    if (requestStep === 2) body = '<p class="field-hint">Selected service: <strong>' + escapeHtml(requestDraft.document) + '</strong>. Requirements shown are sample text only.</p><form id="request-form" class="form-grid"><div class="form-field"><label for="request-purpose">Purpose <span aria-hidden="true">*</span></label><select id="request-purpose" required><option value="">Choose purpose</option><option>Employment</option><option>School requirement</option><option>Government transaction</option><option>Other</option></select></div><div class="form-field"><label for="request-contact">Contact number</label><input id="request-contact" inputmode="tel" placeholder="09xx xxx xxxx"></div><div class="form-field full"><label for="request-attachments">Supporting files <span class="optional-label">(optional demo)</span></label><input id="request-attachments" type="file" accept=".pdf,.jpg,.jpeg,.png" multiple><span class="field-hint">PDF or image, up to 5 MB each. Files stay in this browser preview and are not uploaded or saved.</span></div><div class="form-field full"><label for="request-notes">Additional details</label><textarea id="request-notes" maxlength="400" placeholder="Optional details for the service desk"></textarea><span class="field-hint">Do not enter sensitive personal information in this prototype.</span></div></form>';
    else if (requestStep === 3) body = '<p>Please review the example request. No real request will be sent.</p><dl class="review-list"><div><dt>Document</dt><dd>' + escapeHtml(requestDraft.document) + '</dd></div><div><dt>Purpose</dt><dd>' + escapeHtml(requestDraft.purpose) + '</dd></div><div><dt>Contact</dt><dd>' + escapeHtml(requestDraft.contact || 'Not provided') + '</dd></div><div><dt>Files</dt><dd>' + escapeHtml(requestDraft.attachments?.join(', ') || 'None') + '</dd></div><div><dt>Requirements</dt><dd>Confirm actual requirements with the barangay</dd></div></dl>';
    else if (requestStep === 4) body = '<div class="empty-card">' + icon('Check') + '<strong>Demo request preview created</strong>This is a temporary interface example only. No account, database, or staff member received it.</div>';
    const actions = requestStep === 4
        ? '<button class="button button-primary" type="button" data-modal-action="finish-request">Done</button>'
        : '<button class="button button-secondary" type="button" data-modal-action="cancel-request">Cancel</button>' +
            (requestStep > 2 ? '<button class="button button-secondary" type="button" data-modal-action="back-request">Back</button>' : '') +
            (requestStep === 2 ? '<button class="button button-primary" type="button" data-modal-action="review-request">Review request</button>' : '<button class="button button-primary" type="button" data-modal-action="submit-request">Submit demo</button>');
    document.getElementById('modal-content').innerHTML = stepper + body + '<div class="modal-actions">' + actions + '</div>';
    openModal(false);
    if (requestStep === 2) document.getElementById('request-purpose').focus();
}

function handleModalAction(action) {
    if (action === 'cancel-request' || action === 'finish-request') return closeModal();
    if (action === 'back-request') { requestStep = 2; return renderRequestModal(); }
    if (action === 'review-request') {
        const form = document.getElementById('request-form');
        if (!form.reportValidity()) return;
        const files = [...document.getElementById('request-attachments').files];
        const invalidFile = files.find(file => !['application/pdf','image/jpeg','image/png'].includes(file.type) || file.size > 5 * 1024 * 1024);
        if (invalidFile) {
            toast('Choose PDF or image files no larger than 5 MB each.');
            return;
        }
        requestDraft.purpose = document.getElementById('request-purpose').value;
        requestDraft.contact = document.getElementById('request-contact').value.trim();
        requestDraft.notes = document.getElementById('request-notes').value.trim();
        requestDraft.attachments = files.map(file => file.name);
        requestStep = 3;
        return renderRequestModal();
    }
    if (action === 'submit-request') { requestStep = 4; return renderRequestModal(); }
    if (action === 'save-form') {
        const form = document.getElementById('generic-form');
        if (!form.reportValidity()) return;
        closeModal();
        toast('Saved in this prototype session only. No data was sent to a server.');
    }
}

function openFormModal(title, kind) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-eyebrow').textContent = 'MOCK FORM · NOT SAVED';
    let fields = '';
    if (kind === 'concern') fields = '<div class="form-field full"><label for="concern-category">Concern type *</label><select id="concern-category" required><option value="">Select type</option><option>Street or lighting</option><option>Waste collection</option><option>Community safety</option><option>Other</option></select></div><div class="form-field full"><label for="concern-description">Describe the concern *</label><textarea id="concern-description" required minlength="10" maxlength="1000" placeholder="Describe what happened and where. Avoid including unnecessary sensitive information."></textarea></div><div class="form-field"><label for="concern-contact">Preferred contact method</label><select id="concern-contact"><option>In-app message</option><option>Phone</option></select></div>';
    else if (kind === 'announcement') fields = '<div class="form-field full"><label for="announcement-title">Announcement title *</label><input id="announcement-title" required maxlength="120" placeholder="Short, clear title"></div><div class="form-field"><label for="announcement-audience">Audience *</label><select id="announcement-audience" required><option>All residents</option><option>Selected area</option></select></div><div class="form-field"><label for="announcement-date">Publish date *</label><input id="announcement-date" type="date" required></div><div class="form-field full"><label for="announcement-body">Message *</label><textarea id="announcement-body" required minlength="10" maxlength="2000" placeholder="Add the details residents need to know"></textarea></div>';
    else if (kind === 'document') fields = '<div class="form-field"><label for="document-name">Document name *</label><input id="document-name" required maxlength="100"></div><div class="form-field"><label for="document-availability">Availability</label><select id="document-availability"><option>Available</option><option>Under review</option></select></div><div class="form-field full"><label for="document-requirements">Requirements *</label><textarea id="document-requirements" required maxlength="1000"></textarea></div><p class="field-hint form-field full">Actual fees, requirements, and approval rules need confirmation by the barangay.</p>';
    else fields = '<div class="form-field"><label for="profile-demo-name">Display name</label><input id="profile-demo-name" value="Sample Resident A"></div><div class="form-field"><label for="profile-demo-contact">Contact preference</label><select id="profile-demo-contact"><option>In-app message</option><option>Phone</option></select></div><p class="field-hint form-field full">Profile values are examples and will not be stored.</p>';
    document.getElementById('modal-content').innerHTML = '<form id="generic-form" class="form-grid" data-kind="' + kind + '">' + fields + '</form><div class="modal-actions"><button class="button button-secondary" type="button" data-modal-action="cancel-request">Cancel</button><button class="button button-primary" type="button" data-modal-action="save-form">Save preview</button></div>';
    openModal();
}

function openAuthStates() {
    document.getElementById('modal-title').textContent = 'Authentication screen states';
    document.getElementById('modal-eyebrow').textContent = 'VISUAL PREVIEW ONLY';
    const states = [['signin','Sign in'],['register','Account request'],['forgot','Forgot password'],['reset','Reset password'],['verify','Email verification'],['pending','Pending approval']];
    document.getElementById('modal-content').innerHTML = '<p class="field-hint">Preview the proposed authentication states. Forms are mock-only: they do not create accounts, send email, validate identity, or grant access.</p><div class="auth-state-grid">' + states.map(([key,label]) => '<button type="button" class="auth-state-button" data-auth-state="' + key + '">' + label + '</button>').join('') + '</div><div class="auth-state-message" id="auth-state-message">Choose a state to preview its screen.</div>';
    openModal();
}

function handleModalContentClick(event) {
    const authState = event.target.closest('[data-auth-state]');
    if (authState) renderAuthState(authState.dataset.authState);
    const modalAction = event.target.closest('[data-modal-action]');
    if (modalAction) handleModalAction(modalAction.dataset.modalAction);
}

function renderAuthState(state) {
    const stateContent = {
        signin: ['Mock sign in','Credentials are not checked and no session is created.','<div class="form-field"><label for="mock-user">Username</label><input id="mock-user" autocomplete="username" required></div><div class="form-field"><label for="mock-password">Password</label><input id="mock-password" type="password" autocomplete="current-password" required></div>'],
        register: ['Request an account','Public registration is closed in the current application. This is an example of a future request screen.','<div class="form-field"><label for="mock-register-name">Full name</label><input id="mock-register-name" required></div><div class="form-field"><label for="mock-register-email">Email address</label><input id="mock-register-email" type="email" required></div>'],
        forgot: ['Forgot password','A production service should send a one-time recovery link without disclosing whether the email is registered. No email is sent.','<div class="form-field"><label for="mock-recovery-email">Email address</label><input id="mock-recovery-email" type="email" required></div>'],
        reset: ['Reset password','A real reset requires a server-verified, expiring reset token. This mock does not change any password.','<div class="form-field"><label for="mock-new-password">New password</label><input id="mock-new-password" type="password" minlength="8" required></div><div class="form-field"><label for="mock-confirm-password">Confirm password</label><input id="mock-confirm-password" type="password" minlength="8" required></div>'],
        verify: ['Email verification','Verification codes must be issued and validated by the server. Nothing is issued or verified here.','<div class="form-field"><label for="mock-code">Example verification code</label><input id="mock-code" inputmode="numeric" minlength="6" maxlength="6" required></div>'],
        pending: ['Pending approval','An account would remain restricted until reviewed by an authorized administrator. No account or permission is changed.','<div class="auth-state-message">Your account request is awaiting review.<br>Sample state · no real application was submitted</div>']
    };
    const item = stateContent[state];
    document.getElementById('auth-state-message').innerHTML = '<strong>' + escapeHtml(item[0]) + '</strong><p>' + escapeHtml(item[1]) + '</p><form id="auth-state-form" class="form-grid">' + item[2] + (state === 'pending' ? '' : '<div class="form-field full"><button class="button button-primary" type="submit">Preview state</button></div>') + '</form>';
    document.getElementById('auth-state-message').scrollIntoView({block:'nearest'});
    document.querySelector('#auth-state-form input')?.focus();
}

function handleModalSubmit(event) {
    event.preventDefault();
    const form = event.target;
    if (form.id === 'auth-state-form') {
        if (form.id === 'auth-state-form') {
            const password = form.querySelector('#mock-new-password');
            const confirm = form.querySelector('#mock-confirm-password');
            if (password && password.value !== confirm.value) {
                confirm.setCustomValidity('Passwords do not match.');
                confirm.reportValidity();
                confirm.setCustomValidity('');
                return;
            }
        }
        toast('Mock screen submitted for preview only. No account, password, email, or session was changed.');
        return;
    }
    if (!form.reportValidity()) return;
    toast('Form validated in the prototype. Nothing was sent or saved.');
    closeModal();
}

function updateRequestStatus(id) {
    const row = sampleData.requests.find(item => item.id === id);
    if (!row) return;
    const transitions = ['Submitted','For staff review','Correction required','Approved','Ready for release','Released'];
    const index = transitions.indexOf(row.status);
    row.status = transitions[Math.min(index + 1, transitions.length - 1)];
    updateTable();
    toast(id + ' updated to "' + row.status + '" in this prototype session only.');
}

function cancelRequest(id) {
    const row = sampleData.requests.find(item => item.id === id);
    if (!row || !window.confirm('Cancel this sample request in the prototype?')) return;
    row.status = 'Cancelled';
    updateTable();
    toast(id + ' marked cancelled in this prototype only.');
}

function openModal(restoreFocus = true) {
    if (restoreFocus) pendingFocus = document.activeElement;
    document.getElementById('modal-backdrop').hidden = false;
    document.body.style.overflow = 'hidden';
    document.getElementById('modal-close').focus();
}

function closeModal() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.style.overflow = '';
    if (pendingFocus && typeof pendingFocus.focus === 'function') pendingFocus.focus();
}

function toast(message) {
    const region = document.getElementById('toast-region');
    const item = document.createElement('div');
    item.className = 'toast';
    item.textContent = message;
    region.appendChild(item);
    setTimeout(() => item.remove(), 3500);
}

function toggleMobileNavigation() {
    const sidebar = document.getElementById('sidebar');
    const button = document.getElementById('mobile-menu');
    const open = sidebar.classList.toggle('mobile-open');
    document.getElementById('sidebar-scrim').classList.toggle('visible', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
}

function closeMobileNavigation() {
    document.getElementById('sidebar').classList.remove('mobile-open');
    document.getElementById('sidebar-scrim').classList.remove('visible');
    const button = document.getElementById('mobile-menu');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open navigation');
}

function toggleCollapsedNavigation() {
    const collapsed = document.getElementById('app-shell').classList.toggle('sidebar-collapsed');
    const button = document.getElementById('collapse-menu');
    button.setAttribute('aria-pressed', String(collapsed));
    button.setAttribute('aria-label', collapsed ? 'Expand navigation' : 'Collapse navigation');
}

function toggleNotifications() {
    const panel = document.getElementById('notification-panel');
    const button = document.getElementById('notification-button');
    panel.hidden = !panel.hidden;
    button.setAttribute('aria-expanded', String(!panel.hidden));
}

function closeNotifications() {
    document.getElementById('notification-panel').hidden = true;
    document.getElementById('notification-button').setAttribute('aria-expanded', 'false');
}
