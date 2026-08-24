const DATA_FILES = [1, 2, 3, 4].map((level) => `assets/omoi/data/level${level}.json`);
const PAGE_SIZE = 36;

const state = {
  all: [],
  filtered: [],
  visible: PAGE_SIZE
};

const list = document.getElementById("questionCatalogList");
const resultCount = document.getElementById("questionResultCount");
const loadMore = document.getElementById("questionLoadMore");
const empty = document.getElementById("questionCatalogEmpty");
const search = document.getElementById("questionSearch");
const levelFilter = document.getElementById("questionLevelFilter");
const categoryFilter = document.getElementById("questionCategoryFilter");
const sensitivityFilter = document.getElementById("questionSensitivityFilter");

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function fillCategoryOptions() {
  const categories = [...new Set(state.all.map((question) => question.category).filter(Boolean))].sort();
  categories.forEach((category) => categoryFilter.appendChild(createOption(category, category)));
}

function createMeta(question) {
  const meta = document.createElement("p");
  meta.className = "question-meta";
  const fields = [
    `category: ${question.category || "未設定"}`,
    `sensitivity: ${question.sensitivity ?? "未設定"}`,
    `収録: level${question.sourceFileLevel}.json`
  ];
  if (question.topic) fields.push(`topic: ${question.topic}`);
  if (question.perspective) fields.push(`perspective: ${question.perspective}`);
  meta.textContent = fields.join(" / ");
  return meta;
}

function createDetails(question) {
  if (!question.detail?.text) return null;

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "この問いを知る";
  details.appendChild(summary);

  question.detail.text.split(/\n\s*\n/).forEach((paragraph) => {
    const text = document.createElement("p");
    text.textContent = paragraph;
    details.appendChild(text);
  });

  const sources = question.detail.sources || [];
  if (sources.length > 0) {
    const heading = document.createElement("h4");
    heading.textContent = "出典";
    details.appendChild(heading);
    const sourceList = document.createElement("ul");
    sources.forEach((source) => {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = source.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = source.title;
      item.appendChild(link);
      sourceList.appendChild(item);
    });
    details.appendChild(sourceList);
  }

  return details;
}

function createQuestionEntry(question) {
  const entry = document.createElement("article");
  entry.className = "question-entry";

  const header = document.createElement("header");
  const level = document.createElement("span");
  level.className = "question-level";
  level.textContent = `Level ${question.level}`;
  const id = document.createElement("code");
  id.textContent = question.id || "id未設定";
  header.append(level, id);

  const title = document.createElement("h3");
  title.textContent = question.question;
  entry.append(header, title, createMeta(question));
  const details = createDetails(question);
  if (details) entry.appendChild(details);
  return entry;
}

function updateFilterOptions() {
  const query = search.value.trim().toLocaleLowerCase("ja-JP");
  const level = levelFilter.value;
  const category = categoryFilter.value;
  const sensitivity = sensitivityFilter.value;

  state.filtered = state.all.filter((question) => {
    const searchable = [question.question, question.category, question.topic, question.detail?.text].filter(Boolean).join(" ").toLocaleLowerCase("ja-JP");
    return (!query || searchable.includes(query)) &&
      (!level || String(question.level) === level) &&
      (!category || question.category === category) &&
      (!sensitivity || String(question.sensitivity) === sensitivity);
  });
  state.visible = PAGE_SIZE;
  renderCatalog();
}

function renderCatalog() {
  list.replaceChildren();
  state.filtered.slice(0, state.visible).forEach((question) => list.appendChild(createQuestionEntry(question)));
  resultCount.textContent = `${state.filtered.length}件中 ${Math.min(state.visible, state.filtered.length)}件を表示`;
  empty.hidden = state.filtered.length !== 0;
  loadMore.hidden = state.visible >= state.filtered.length;
}

async function loadQuestions() {
  const responses = await Promise.all(DATA_FILES.map((file) => fetch(file).then((response) => response.json())));
  state.all = responses.flatMap((questions, index) => questions.map((question) => ({
    ...question,
    sourceFileLevel: index + 1
  })));
  fillCategoryOptions();
  updateFilterOptions();
}

[search, levelFilter, categoryFilter, sensitivityFilter].forEach((control) => control.addEventListener("input", updateFilterOptions));
loadMore.addEventListener("click", () => {
  state.visible += PAGE_SIZE;
  renderCatalog();
});

loadQuestions().catch(() => {
  resultCount.textContent = "質問データを読み込めませんでした";
  empty.hidden = false;
  empty.textContent = "質問JSONを読み込めませんでした。GitHubの公式データを確認してください。";
});
