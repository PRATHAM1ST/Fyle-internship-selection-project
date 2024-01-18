const githubSearchUserForm = document.getElementById("github-search-user-form");
const githubUserRepoListPerPage = document.querySelector(
	".github-user-repo-list-per-page"
);

githubSearchUserForm.addEventListener("submit", GithubSearchUser, false);
githubUserRepoListPerPage.addEventListener(
	"submit",
	(e) => {
		e.preventDefault();
		GithubUserReposDisplay(1);
	},
	false
);

let userData;

// This function is triggered when the form is submitted.
// It fetches the user data from the GitHub API and handles the response.
function GithubSearchUser(e) {
	e.preventDefault();
	const username = document.getElementById("github-username").value;
	const url = `https://api.github.com/users/${username}`;
	fetch(url)
		.then((res) => res.json())
		.then((data) => {
			if (data.message == "Not Found") {
				githubSearchUserForm.classList.add("ideal");
				alert("User not found");
			} else {
				userData = data;
				githubSearchUserForm.classList.remove("ideal");
				githubSearchUserForm.reset();
				GithubUserfound(data);
			}
		})
		.catch((err) => {
			githubSearchUserForm.classList.add("ideal");
			alert(err);
		});
}

// This function fetches the repositories of a given GitHub user.
// It takes the username and page number as parameters.
async function GetGithubUserRepos(username, page = 1) {
	const githubUserRepoListPerPage = parseInt(
		document.querySelector(".github-user-repo-list-per-page input").value
	);
	const url = `https://api.github.com/users/${username}/repos?per_page=${githubUserRepoListPerPage}&page=${page}`;
	return await fetch(url)
		.then((res) => res.json())
		.then((data) => data)
		.catch((err) => alert(err));
}

// This function is called when a GitHub user is found.
// It updates the UI to display the user's information and repositories.
function GithubUserfound() {
	const githubUserRepoListPerPage = document.querySelector(
		".github-user-repo-list-per-page"
	);
	githubUserRepoListPerPage.style.display = "none";
	if (userData.message == "Not Found") {
		alert("User not found");
		return;
	}
	githubUserRepoListPerPage.style.display = "block";
	GithubUserInfoDisplay();
	GithubUserGithubLinkDisplay();
	GithubUserReposDisplay(1);
}

// This function updates the UI to display the GitHub user's information.
function GithubUserInfoDisplay() {
	const githubUserInfo = document.getElementById("github-user-info");
	githubUserInfo.innerHTML = `
            <div class="github-user-image-container">
                <img src=${userData.avatar_url} alt=${userData.login} id="github-user-image" />
            </div>
            <div class="github-user-info-container">
                <div class="github-user-name">
                    <h1 id="github-user-name">${userData.name}</h1>
                </div>
                <div class="github-user-bio">
                    <p id="github-user-bio">${userData.bio}</p>
                </div>
                <div class="github-user-stats-container">
                    <span id="github-user-followers">Followers: ${userData.followers}</span>
                    <span id="github-user-following">Following: ${userData.following}</span>
                    <span id="github-user-repos">Public Repos:${userData.public_repos}</span>
                </div>
                <div class="github-user-location">
                    <span id="github-user-location"><i class="fa-solid fa-location-dot"></i> ${userData.location}</span>
                </div>
                <div class="github-user-social-links">
					<i class="fa-brands fa-twitter"></i> <a href="https://twitter.com/${userData.twitter_username}" id="github-user-twitter-link">https://twitter.com/${userData.twitter_username}</a>
                </div>
            </div>
        `;
}

// This function updates the UI to display the GitHub user's GitHub link.
function GithubUserGithubLinkDisplay() {
	const githubUserGithubLink = document.getElementById(
		"github-user-github-link"
	);
	githubUserGithubLink.innerHTML = `
		<i class="fa-brands fa-github"></i> <a href=${userData.html_url} id="github-user-github-url">${userData.html_url}</a>
    `;
}

// This function fetches the repositories of a given GitHub user.
// It takes the username and page number as parameters.
async function GithubUserReposDisplay(page) {
	const githubUserRepos = document.getElementById("github-user-repos-list");
	githubUserRepos.innerHTML = "<div class='loading'> <i class='fa-brands fa-github'></i> Loading... </div>";
	const username = userData.login;
	const userRepos = await GetGithubUserRepos(username, page);
	if (userRepos.message == "Not Found") {
		alert("User not found");
		return;
	}
	githubUserRepos.innerHTML = "";
	userRepos.forEach((repo) => {
		const createTempDiv = document.createElement("a");
		createTempDiv.href = repo.html_url;
		createTempDiv.classList.add("repo-container");
		createTempDiv.innerHTML = `
			<h1 class="repo-title">${repo.name}</h1>
			<p class="repo-description">${repo.description ?? "Description not found"}</p>
			${
				repo.topics.length > 0
					? `<div class="repo-topics">
						${
							repo.topics.length > 0 &&
							repo.topics
								.map((topic) => {
									return `<span class="repo-topic">${topic}</span>`;
								})
								.join("")
						}
					</div>`
					: ""
			}
		`;
		githubUserRepos.appendChild(createTempDiv);
	});

	GithubUserReposPaginationDisplay(
		parseInt(
			document.querySelector(".github-user-repo-list-per-page input")
				.value
		),
		page
	);
}

// This function updates the UI to display the pagination for the repositories.
// It takes the number of repositories per page and the current page as parameters.
function GithubUserReposPaginationDisplay(reposPerPage, currentPage) {
	const githubUserReposPagination = document.getElementById(
		"github-user-repos-pagination"
	);
	githubUserReposPagination.innerHTML = "";
	const pages = Math.ceil(userData.public_repos / reposPerPage);

	if (pages == 0) {
		return;
	}

	githubUserReposPagination.innerHTML = `
		<button class="github-user-repos-pagination-item prev" ${
			currentPage == 1 ? "disabled" : ""
		} ${
		currentPage != 1
			? `onclick="GithubUserReposDisplay(${currentPage - 1})"`
			: ""
	}>
			Prev
		</button>
	`;

	[...Array(pages).keys()].map((page) => {
		githubUserReposPagination.innerHTML += `
		<button class="github-user-repos-pagination-item" ${
			currentPage == page + 1 ? "disabled" : ""
		} ${
			currentPage != page + 1
				? `onclick="GithubUserReposDisplay(${page + 1})"`
				: ""
		}>
			${page + 1}
		</button>
	`;
	});

	githubUserReposPagination.innerHTML += `
		<button class="github-user-repos-pagination-item next" ${
			currentPage == pages ? "disabled" : ""
		} ${
		currentPage != pages
			? `onclick="GithubUserReposDisplay(${currentPage + 1})"`
			: ""
	}>
			Next
		</button>
	`;
}
