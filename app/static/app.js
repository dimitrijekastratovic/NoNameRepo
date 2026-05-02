function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    const themeColor = localStorage.getItem("theme");

    if (themeColor === "dark") {
        document.body.classList.add(themeColor);
        localStorage.setItem("theme", "dark");
        themeToggle.innerHTML = "☀️";
    }

    themeToggle.addEventListener("click", () => {
        if (document.body.classList.contains("dark")) {
            document.body.classList.remove("dark");
            localStorage.setItem("theme", "light");
            themeToggle.innerHTML = "🌙";
        } else {
            document.body.classList.add("dark");
            localStorage.setItem("theme", "dark");
            themeToggle.innerHTML = "☀️";
        }
    });
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
                topicHeading.textContent = topic.topic;
                topicGroup.appendChild(topicHeading);

                topic.articles.forEach(article => {
                    const articleLink = document.createElement("a");
                    articleLink.className = "article-link";
                    articleLink.href = "#";
                    articleLink.textContent = article.replace(/-/g, " ");
                    articleLink.addEventListener("click", (e) => {
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
        })
        .catch(error => console.error("Error fetching article:", error));
}

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    fetchTopics();
});