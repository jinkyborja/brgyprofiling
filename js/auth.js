document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const registrationForm = document.getElementById('registration-form');
    const loginSection = document.getElementById('login-section');
    const registrationSection = document.getElementById('registration-section');

    document.querySelectorAll('[data-password-toggle]').forEach(function (toggle) {
        toggle.addEventListener('click', function () {
            const passwordInput = document.getElementById(toggle.dataset.passwordToggle);
            const visible = passwordInput.type === 'password';

            passwordInput.type = visible ? 'text' : 'password';
            toggle.setAttribute('aria-pressed', visible ? 'true' : 'false');
            toggle.setAttribute('aria-label', visible ? 'Hide password' : 'Show password');
            toggle.innerHTML = visible
                ? '<i class="fas fa-eye-slash" aria-hidden="true"></i>'
                : '<i class="fas fa-eye" aria-hidden="true"></i>';
        });
    });

    function showSection(section) {
        const showRegistration = section === registrationSection;
        loginSection.hidden = showRegistration;
        registrationSection.hidden = !showRegistration;
        loginSection.classList.toggle('active', !showRegistration);
        registrationSection.classList.toggle('active', showRegistration);
        clearMessage(showRegistration ? 'registration-message' : 'login-message');
        const focusTarget = section.querySelector('input');
        if (focusTarget) {
            focusTarget.focus();
        }
    }

    document.querySelectorAll('[data-show-registration]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSection(registrationSection);
        });
    });

    document.querySelectorAll('[data-show-login]').forEach(function (button) {
        button.addEventListener('click', function () {
            showSection(loginSection);
        });
    });

    const initialSection = new URLSearchParams(window.location.search).get('action') === 'register'
        ? registrationSection
        : loginSection;
    showSection(initialSection);

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (loginForm.dataset.submitting === 'true') {
            return;
        }

        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        submitForm({
            form: loginForm,
            button: loginForm.querySelector('[type="submit"]'),
            loadingId: 'login-loading',
            messageId: 'login-message',
            url: 'bootstrap/login.php',
            payload: { username: username, password: password },
            loadingText: 'Logging in...',
            successRedirect: 'dashboard.php',
            successMessage: 'Sign-in successful.'
        });
    });

    registrationForm.addEventListener('submit', function (event) {
        event.preventDefault();
        if (registrationForm.dataset.submitting === 'true') {
            return;
        }

        submitForm({
            form: registrationForm,
            button: registrationForm.querySelector('[type="submit"]'),
            loadingId: 'registration-loading',
            messageId: 'registration-message',
            url: registrationForm.action,
            payload: {
                first_name: document.getElementById('register-first-name').value.trim(),
                last_name: document.getElementById('register-last-name').value.trim(),
                email: document.getElementById('register-email').value.trim(),
                username: document.getElementById('register-username').value.trim(),
                password: document.getElementById('register-password').value
            },
            loadingText: 'Submitting account request...',
            successMessage: null
        });
    });
});

function submitForm(options) {
    const loading = document.getElementById(options.loadingId);
    const loadingMessage = loading.querySelector('p');
    const button = options.button;
    options.form.dataset.submitting = 'true';
    button.disabled = true;
    loading.style.display = 'block';
    loadingMessage.textContent = options.loadingText;
    clearMessage(options.messageId);

    fetch(options.url, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options.payload)
    })
        .then(async function (response) {
            let data;
            try {
                data = await response.json();
            } catch (error) {
                throw new Error('The server returned an unexpected response. Check your connection and try again.');
            }

            if (!response.ok || data.status !== 'success') {
                throw new Error(data.message || 'The request could not be completed. Try again.');
            }
            return data;
        })
        .then(function (data) {
            showMessage(options.messageId, data.message || options.successMessage || 'Request completed.', 'success');
            if (options.successRedirect) {
                setTimeout(function () {
                    window.location.href = data.redirect || options.successRedirect;
                }, 500);
            } else {
                options.form.reset();
            }
        })
        .catch(function (error) {
            console.error('Authentication request failed:', error);
            showMessage(options.messageId, error.message || 'Network error. Check your connection and try again.', 'error');
        })
        .finally(function () {
            loading.style.display = 'none';
            button.disabled = false;
            options.form.dataset.submitting = 'false';
        });
}

function clearMessage(elementId) {
    const message = document.getElementById(elementId);
    message.textContent = '';
    message.className = 'message';
    message.style.display = 'none';
}

function showMessage(elementId, message, type) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = 'message ' + type;
    element.style.display = 'block';
    element.focus();
}
