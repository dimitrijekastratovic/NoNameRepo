const HLJS_DARK = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark-dimmed.min.css";
const HLJS_LIGHT = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";

function isDark() {
    return document.body.classList.contains("dark");
}

function applyTheme(dark) {
    const hljsLink = document.getElementById("highlight-css");
    
    if (hljsLink) {
        hljsLink.href = dark ? HLJS_DARK : HLJS_LIGHT;
    }

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

function slugToTitle(name) {
    return name.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
});