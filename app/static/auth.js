function isDark() {
    return document.body.classList.contains("dark");
}

function applyTheme(dark) {
    if (dark) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
        document.querySelectorAll(".theme-toggle").forEach(btn => btn.innerHTML = "☀️");
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
        document.querySelectorAll(".theme-toggle").forEach(btn => btn.innerHTML = "🌙");
    }
}

function initTheme() {
    applyTheme(localStorage.getItem("theme") === "dark");
    document.querySelectorAll(".theme-toggle").forEach(btn => {
        btn.addEventListener("click", () => applyTheme(!isDark()));
    });
}

function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        if (response.ok) {
            window.location.href = "/";
        } else {
            response.json().then(data => {
                    const error = document.getElementById("auth-error");
                    error.textContent = data.detail;
                    error.classList.remove("hidden");
            });
        }
    })
    .catch(error => console.error("Error during login:", error));
}

function register() {
    const firstName = document.getElementById("first_name").value;
    const lastName = document.getElementById("last_name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm_password").value;

    if (password !== confirmPassword) {
        const error = document.getElementById("auth-error");
        error.textContent = "Passwords do not match.";
        error.classList.remove("hidden");
        return;
    }

    const user = { first_name: firstName, last_name: lastName, email, password };

    fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
    })
    .then(response => {
        if (response.ok) {
            window.location.href = "/login";
        } else {
            response.json().then(data => {
                    const error = document.getElementById("auth-error");
                    error.textContent = data.detail;
                    error.classList.remove("hidden");
            });
        }
    })
    .catch(error => console.error("Error during registration:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();

    document.querySelectorAll(".toggle-password").forEach(btn => {
        btn.addEventListener("click", () => {
            const input = document.getElementById(btn.dataset.target);
            input.type = input.type === "password" ? "text" : "password";
        });
    });

    const loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.addEventListener("submit", (e) => { e.preventDefault(); login(); });

    const registerForm = document.getElementById("register-form");
    if (registerForm) registerForm.addEventListener("submit", (e) => { e.preventDefault(); register(); });
});