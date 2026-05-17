function fetchTopics() {
    fetch("/topics")
        .then(response => response.json())
        .then(data => {
            buildTopicCards(data.topics);
        })
        .catch(error => console.error("Error fetching topics:", error));
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
        card.addEventListener("click", navigateToStudy);
        container.appendChild(card);
    });
}

function navigateToStudy() {
    fetch("/auth/me").then(response => {
        if (response.ok) {
            window.location.href = "/study";
        } else {
            window.location.href = "/login";
        }
    })
    .catch(error => console.error("Error during authentication check:", error));

};

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
    fetchTopics();
    document.getElementById("start-btn").addEventListener("click", navigateToStudy);

    fetch("/auth/me").then(response => {
        if (response.ok) {
            const btnGroup = document.querySelector("#topbar div");
            const logoutBtn = document.createElement("button");
            logoutBtn.id = "logout-btn";
            logoutBtn.textContent = "Log out";
            btnGroup.appendChild(logoutBtn);
            logoutBtn.addEventListener("click", logout);
        }
    });
});
