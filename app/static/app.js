function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    const themeColor = localStorage.getItem("theme");

    if (themeColor === "dark") {
        document.body.classList.add(themeColor);
        localStorage.setItem("theme", "dark");
        themeToggle.innerHTML = "☀️";
    }
    else {
        document.getElementById("highlight-css").href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
    }

    themeToggle.addEventListener("click", () => {
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
            document.getElementById("highlight-css").href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";
            themeToggle.innerHTML = "🌙";
        } else {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
            document.getElementById("highlight-css").href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark-dimmed.min.css";
            themeToggle.innerHTML = "☀️";
        }
    });
}

function slugToTitle(name) {
    return name.replace(/-/g, " ").replace(/\b\w/g, char => char.toUpperCase());
}

function fetchTopics() {
    fetch("/topics")
        .then(response => response.json())
        .then(data => {
            const topicList = document.getElementById("topic-list");
            data.topics.forEach(topic => {
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
                    articleLink.addEventListener("click", (e) => {
                        const activeLink = document.querySelector(".article-link.active");
                        if (activeLink) {
                            activeLink.classList.remove("active");
                        }
                        articleLink.classList.add("active");
                        fetchArticle(topic.topic, article);
                    });
                    topicGroup.appendChild(articleLink);
                });
                topicList.appendChild(topicGroup);
            });
        })
        .catch(error => console.error("Error fetching topics:", error));
}

function fetchArticle(topic, article) {
    fetch(`/topics/${topic}/${article}`)
        .then(response => response.json())
        .then(data => {
            const content = document.getElementById("article-body");
            content.innerHTML = marked.parse(data.content);
            addCopyButtons();
            hljs.highlightAll();
        })
        .catch(error => console.error("Error fetching article:", error));
}

function addCopyButtons() {
    const codeBlocks = document.querySelectorAll("#article-body pre");
    codeBlocks.forEach(block => {
        const copyBtn = document.createElement("button");
        copyBtn.className = "copy-btn";
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(block.querySelector("code").textContent)
                .then(() => {
                    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 16 4 11"/></svg>`;
                    setTimeout(() => {
                        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
                    }, 2000);
                })
                .catch(err => console.error("Failed to copy text: ", err));
        });
        block.appendChild(copyBtn);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    fetchTopics();
});