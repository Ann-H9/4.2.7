const searchInput = document.getElementById("search-input");
const suggestionsList = document.getElementById("suggestions-list");
const reposList = document.getElementById("repos-list");

let selectedRepos = [];
let debounceTimer;

async function fetchRepositories(query) {
  if (!query.trim()) {
    suggestionsList.style.display = "none";
    return [];
  }

  try {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${query}&per_page=5`
    );
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Ошибочка:", error);
    return [];
  }
}

searchInput.addEventListener("input", (e) => {
  clearTimeout(debounceTimer);
  const query = e.target.value;

  debounceTimer = setTimeout(async () => {
    const repos = await fetchRepositories(query);
    showSuggestions(repos);
  }, 500);
});

function showSuggestions(repos) {
  if (repos.length === 0) {
    suggestionsList.style.display = "none";
    return;
  }

  suggestionsList.innerHTML = repos
    .map(
      (repo) => `
      <li data-repo='${JSON.stringify({
        name: repo.name,
        owner: repo.owner.login,
        stars: repo.stargazers_count,
      })}'>
        ${repo.name} (${repo.owner.login})
      </li>
    `
    )
    .join("");

  suggestionsList.style.display = "block";
}

suggestionsList.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    const repoData = JSON.parse(e.target.dataset.repo);
    selectedRepos.push(repoData);
    renderReposList();
    searchInput.value = "";
    suggestionsList.style.display = "none";
  }
});

function renderReposList() {
  reposList.innerHTML = selectedRepos
    .map(
      (repo, index) => `
      <li>
        <div>
          <bold>${repo.name}</bold> (${repo.owner}) ⭐ ${repo.stars}
        </div>
        <button onclick="removeRepo(${index})">Удалить</button>
      </li>
    `
    )
    .join("");
}

function removeRepo(index) {
  selectedRepos.splice(index, 1);
  renderReposList();
}
