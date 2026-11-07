document.addEventListener('DOMContentLoaded', function () {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const navigation = document.querySelector('.sidebar-menu');
    const logoutButton = document.getElementById('logout-btn');

    if (navigation) {
        navigation.setAttribute('role', 'navigation');
        navigation.setAttribute('aria-label', 'Main navigation');

        navigation.querySelectorAll('.menu-item').forEach(function (item) {
            item.setAttribute('role', 'link');
            item.setAttribute('tabindex', '0');

            if (item.classList.contains('active')) {
                item.setAttribute('aria-current', 'page');
            }

            item.addEventListener('keydown', function (event) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    item.click();
                }
            });
        });
    }

    if (!sidebar || !menuToggle) {
        if (logoutButton) {
            bindLogout(logoutButton);
        }
        return;
    }

    if (logoutButton) {
        bindLogout(logoutButton);
    }

    menuToggle.setAttribute('aria-label', 'Toggle navigation menu');
    menuToggle.setAttribute('aria-controls', 'sidebar');
    menuToggle.setAttribute('aria-expanded', sidebar.classList.contains('active') ? 'true' : 'false');

    function syncMenuState() {
        const isOpen = sidebar.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    menuToggle.addEventListener('click', function () {
        window.requestAnimationFrame(syncMenuState);
    });

    document.addEventListener('click', function (event) {
        if (
            window.innerWidth <= 768 &&
            sidebar.classList.contains('active') &&
            !sidebar.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            sidebar.classList.remove('active');
        }
        syncMenuState();
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Escape' && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
            syncMenuState();
            menuToggle.focus();
        }
    });
});

function bindLogout(button) {
    button.addEventListener('click', function () {
        button.disabled = true;

        fetch('bootstrap/logout.php', {
            method: 'POST',
            credentials: 'same-origin'
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error('The server could not end the session.');
                }

                localStorage.removeItem('currentUser');
                window.location.href = 'index.html';
            })
            .catch(function (error) {
                console.error('Unable to log out:', error);
                button.disabled = false;
                window.alert('Logout could not be completed. Check your connection and try again.');
            });
    });
}
