const HLJS_DARK = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark-dimmed.min.css";
const HLJS_LIGHT = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 16 4 11"/></svg>`;

function isDark() {
    return document.body.classList.contains("dark");
}

function applyTheme(dark) {
    const hljsLink = document.getElementById("highlight-css");
    if (dark) {
        document.body.classList.add("dark");
        localStorage.setItem("theme", "dark");
        document.querySelectorAll(".theme-toggle").forEach(btn => btn.innerHTML = "☀️");
        hljsLink.href = HLJS_DARK;
    } else {
        document.body.classList.remove("dark");
        localStorage.setItem("theme", "light");
        document.querySelectorAll(".theme-toggle").forEach(btn => btn.innerHTML = "🌙");
        hljsLink.href = HLJS_LIGHT;
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

function showStudy() {
    document.getElementById("landing").classList.add("hidden");
    document.getElementById("study").classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function showLanding() {
    document.getElementById("study").classList.add("hidden");
    document.getElementById("landing").classList.remove("hidden");
    document.body.style.overflow = "";
}

function fetchTopics() {
    fetch("/topics")
        .then(response => response.json())
        .then(data => {
            buildSidebar(data.topics);
            buildTopicCards(data.topics);
        })
        .catch(error => console.error("Error fetching topics:", error));
}

function buildSidebar(topics) {
    const topicList = document.getElementById("topic-list");
    topics.forEach(topic => {
        const topicGroup = document.createElement("div");
        topicGroup.className = "topic-group";

        const topicHeading = document.createElement("div");
        topicHeading.className = "topic-heading";
        topicHeading.textContent = slugToTitle(topic.topic);
        topicGroup.appendChild(topicHeading);

        topic.articles.forEach(article => {
            const articleLink = document.createElement("a");
            articleLink.className = "article-link";
            articleLink.href = "#";
            articleLink.textContent = slugToTitle(article);
            articleLink.addEventListener("click", () => {
                document.querySelectorAll(".article-link.active").forEach(a => a.classList.remove("active"));
                articleLink.classList.add("active");
                fetchArticle(topic.topic, article);
            });
            topicGroup.appendChild(articleLink);
        });

        topicList.appendChild(topicGroup);
    });
}

function buildTopicCards(topics) {
    const container = document.getElementById("topic-cards");
    topics.forEach(topic => {
        const card = document.createElement("div");
        card.className = "topic-card";

        const title = document.createElement("div");
        title.className = "topic-card-title";
        title.textContent = slugToTitle(topic.topic);

        const count = document.createElement("div");
        count.className = "topic-card-count";
        count.textContent = `${topic.articles.length} article${topic.articles.length !== 1 ? "s" : ""}`;

        card.appendChild(title);
        card.appendChild(count);
        card.addEventListener("click", () => showStudy());
        container.appendChild(card);
    });
}

function fetchArticle(topic, article) {
    fetch(`/topics/${topic}/${article}`)
        .then(response => response.json())
        .then(data => {
            const content = document.getElementById("article-body");
            content.innerHTML = marked.parse(data.content);
            hljs.highlightAll();
            addCopyButtons();
        })
        .catch(error => console.error("Error fetching article:", error));
}

function addCopyButtons() {
    document.querySelectorAll("#article-body pre").forEach(block => {
        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.innerHTML = COPY_ICON;
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(block.querySelector("code").textContent)
                .then(() => {
                    copyBtn.innerHTML = CHECK_ICON;
                    setTimeout(() => { copyBtn.innerHTML = COPY_ICON; }, 2000);
                })
                .catch(err => console.error("Failed to copy:", err));
        });
        block.appendChild(copyBtn);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    fetchTopics();
    document.getElementById("start-btn").addEventListener("click", showStudy);
    document.getElementById("back-btn").addEventListener("click", showLanding);
});
