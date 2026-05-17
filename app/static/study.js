const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 16 4 11"/></svg>`;

function fetchTopics() {
    fetch("/topics")
        .then(response => response.json())
        .then(data => {
            buildSidebar(data.topics);
        })
        .catch(error => console.error("Error fetching topics:", error));
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

function logout() {
    fetch("/auth/logout", { method: "POST" })
        .then(response => {
            if (response.ok) {
                window.location.href = "/login";
            } else {
                console.error("Logout failed");
            }
        })
        .catch(error => console.error("Error during logout:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    fetch("/auth/me").then(response => {
        if (!response.ok) {
            window.location.href = "/login";
        } else {
            fetchTopics();
            document.getElementById("logout-btn").addEventListener("click", logout);
        }
    });
});