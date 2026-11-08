const DATA_VERSION = '20261108-main-3eeff5a-catalog-v2';
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
const filterControls = [search, levelFilter, categoryFilter, sensitivityFilter];
const versionSelect = document.getElementById("questionVersion");
const versionSource = document.getElementById("questionVersionSource");
const versionNote = document.getElementById("questionVersionNote");
const snapshots = new Map();
let catalogVersions;
let activeRequest = 0;
let activeController;
let unknownVersion = false;

loadMore.hidden = true;
list.setAttribute("aria-busy", "true");
filterControls.forEach((control) => { control.disabled = true; });

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

function fillCategoryOptions() {
  const selected = categoryFilter.value;
  const categories = [...new Set(state.all.map((question) => question.category).filter(Boolean))].sort();
  categoryFilter.replaceChildren(createOption("", "すべて"));
  categories.forEach((category) => categoryFilter.appendChild(createOption(category, category)));
  categoryFilter.value = categories.includes(selected) ? selected : "";
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
  if (question.role) fields.push(`role: ${question.role}`);
  meta.textContent = fields.join(" / ");
  return meta;
}

function createWarning(question) {
  if (!Array.isArray(question.content_warning) || question.content_warning.length === 0) return null;
  const warning = document.createElement("p");
  warning.className = "question-warning";
  warning.textContent = `content_warning: ${question.content_warning.join(", ")}`;
  return warning;
}

function createScenario(question) {
  if (!question.scenario?.trim()) return null;
  const scenario = document.createElement("p");
  scenario.className = "question-scenario";
  scenario.textContent = `場面：${question.scenario}`;
  return scenario;
}

function createHints(question) {
  if (!question.hints?.length) return null;
  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "会話のヒント";
  const hints = document.createElement("ul");
  question.hints.forEach((hint) => {
    const item = document.createElement("li");
    item.textContent = hint;
    hints.appendChild(item);
  });
  details.append(summary, hints);
  return details;
}

function createDetails(question) {
  const detailText = question.detail?.text || "";
  const sources = question.detail?.sources || [];
  const terms = question.terms || [];
  if (!detailText && !sources.length && !terms.length) return null;

  const details = document.createElement("details");
  const summary = document.createElement("summary");
  summary.textContent = "問いの背景";
  details.appendChild(summary);

  detailText.split(/\n\s*\n/).filter((paragraph) => paragraph.trim()).forEach((paragraph) => {
    const text = document.createElement("p");
    text.textContent = paragraph;
    details.appendChild(text);
  });

  if (terms.length > 0) {
    const heading = document.createElement("h4");
    heading.textContent = "用語";
    const termList = document.createElement("dl");
    terms.forEach((term) => {
      const name = document.createElement("dt");
      name.textContent = term.term;
      const definition = document.createElement("dd");
      definition.textContent = term.definition;
      termList.append(name, definition);
    });
    details.append(heading, termList);
  }

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
  entry.appendChild(header);
  const scenario = createScenario(question);
  if (scenario) entry.appendChild(scenario);
  entry.append(title, createMeta(question));
  const warning = createWarning(question);
  if (warning) entry.appendChild(warning);
  const hints = createHints(question);
  if (hints) entry.appendChild(hints);
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
    const searchable = [
      question.id,
      question.question,
      question.scenario,
      question.hints?.join(" "),
      question.terms?.map((term) => `${term.term} ${term.definition}`).join(" "),
      question.category,
      question.topic,
      question.role,
      question.content_warning?.join(" "),
      question.detail?.text
    ].filter(Boolean).join(" ").toLocaleLowerCase("ja-JP");
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

async function fetchJSON(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

function showLoadError(error) {
  console.error("Omoi question catalog could not load", error);
  list.setAttribute("aria-busy", "false");
  resultCount.textContent = "質問データを読み込めませんでした";
  versionSource.textContent = "選んだ版を読み込めませんでした。別のバージョンを選ぶか、ページを再読み込みしてください。";
  empty.hidden = false;
  empty.textContent = "質問JSONを読み込めませんでした。GitHubの公式データを確認してください。";
  loadMore.hidden = true;
  filterControls.forEach((control) => { control.disabled = true; });
}

function renderVersionSource(entry, metadata) {
  const source = document.createElement("a");
  source.href = `https://github.com/VIUK-Light/Omoi/tree/${entry.commit}`;
  source.textContent = entry.commit.slice(0, 7);
  source.className = "external";
  const release = document.createElement("a");
  release.href = entry.release_url || `https://github.com/VIUK-Light/Omoi/tree/${encodeURIComponent(entry.tag || entry.commit)}`;
  release.textContent = entry.release_date ? "リリースを見る" : entry.tag ? "公開タグを見る" : "公開元を見る";
  versionSource.replaceChildren(
    `表示中：${entry.label} / `,
    ...(entry.release_date ? [`公開日：${entry.release_date} / `] : []),
    `反映日：${metadata.synced_at} / 参照元：VIUK-Light/Omoi / ${entry.tag ? `tag: ${entry.tag}` : "branch: main"} / commit: `,
    source,
    ` / 質問件数: ${metadata.total}件 / コンテンツライセンス：${metadata.license} / `,
    release
  );
  const notes = [];
  if (unknownVersion) notes.push("指定されたバージョンが見つからないため、最新の版を表示しています。");
  const equivalents = catalogVersions.versions.filter((version) => version.commit === entry.commit && version.id !== entry.id);
  if (equivalents.length) notes.push(`${entry.label}と${equivalents.map((version) => version.label).join("・")}は同じコミットの質問データです。`);
  const current = catalogVersions.versions.find((version) => version.id === catalogVersions.default);
  if (entry.commit !== current.commit) notes.push("過去版を表示しています。質問・分類・補助情報は当時のままです。");
  if (metadata.legacy_warnings?.duplicate_ids) notes.push("この版の件数には、当時のデータに含まれるIDの重複も数えています。");
  versionNote.textContent = notes.join(" ");
  versionNote.hidden = notes.length === 0;
}

async function loadQuestions(entry) {
  const request = ++activeRequest;
  activeController?.abort();
  const controller = new AbortController();
  activeController = controller;
  state.all = [];
  state.filtered = [];
  list.replaceChildren();
  list.setAttribute("aria-busy", "true");
  filterControls.forEach((control) => { control.disabled = true; });
  loadMore.hidden = true;
  empty.hidden = true;
  empty.textContent = "該当する質問がありません。";
  versionNote.hidden = true;
  versionSource.textContent = `${entry.label}の質問データを読み込み中...`;
  resultCount.textContent = "質問データを読み込み中...";

  try {
    let snapshot = snapshots.get(entry.commit);
    if (!snapshot) {
      const directory = `assets/omoi/data/versions/${entry.commit}`;
      const metadata = await fetchJSON(`${directory}/source.json?v=${entry.commit}`, { signal: controller.signal });
      if (metadata.commit !== entry.commit || metadata.total !== entry.total) throw new Error("Question version metadata does not match");
      const responses = await Promise.all([1, 2, 3, 4].map(async (level) => {
        const questions = await fetchJSON(`${directory}/level${level}.json?v=${entry.commit}`, { signal: controller.signal });
        if (!Array.isArray(questions) || questions.length !== metadata.files[level - 1].count) throw new Error("Question file count does not match");
        return questions.map((question) => ({ ...question, sourceFileLevel: level }));
      }));
      snapshot = { metadata, questions: responses.flat() };
      snapshots.set(entry.commit, snapshot);
    }
    if (request !== activeRequest) return;
    state.all = snapshot.questions;
    fillCategoryOptions();
    renderVersionSource(entry, snapshot.metadata);
    filterControls.forEach((control) => { control.disabled = false; });
    updateFilterOptions();
    list.setAttribute("aria-busy", "false");
  } catch (error) {
    if (request !== activeRequest) return;
    controller.abort();
    showLoadError(error);
  }
}

function versionFromURL() {
  const requested = new URL(window.location.href).searchParams.get("version");
  const entry = catalogVersions.versions.find((version) => version.id === requested);
  unknownVersion = Boolean(requested && !entry);
  return entry || catalogVersions.versions.find((version) => version.id === catalogVersions.default);
}

async function initializeCatalog() {
  const index = await fetchJSON(`assets/omoi/data/versions.json?v=${DATA_VERSION}`, { cache: "no-cache" });
  if (!Array.isArray(index.versions) || !index.versions.length ||
      !index.versions.some((entry) => entry.id === index.default) ||
      index.versions.some((entry) => !/^[0-9a-f]{40}$/.test(entry.commit))) {
    throw new Error("Invalid question version index");
  }
  catalogVersions = index;
  versionSelect.replaceChildren(...catalogVersions.versions.map((entry) => createOption(
    entry.id, `${entry.label}${entry.id === catalogVersions.default ? "（最新）" : ""} · ${entry.total}件`
  )));
  versionSelect.disabled = false;
  const entry = versionFromURL();
  versionSelect.value = entry.id;
  await loadQuestions(entry);
}

search.addEventListener("input", updateFilterOptions);
[levelFilter, categoryFilter, sensitivityFilter].forEach((control) => control.addEventListener("change", updateFilterOptions));
loadMore.addEventListener("click", () => {
  state.visible += PAGE_SIZE;
  renderCatalog();
});

versionSelect.addEventListener("change", () => {
  const entry = catalogVersions.versions.find((version) => version.id === versionSelect.value);
  const url = new URL(window.location.href);
  url.searchParams.set("version", entry.id);
  window.history.pushState(null, "", url);
  unknownVersion = false;
  loadQuestions(entry);
});
window.addEventListener("popstate", () => {
  if (!catalogVersions) return;
  const entry = versionFromURL();
  versionSelect.value = entry.id;
  loadQuestions(entry);
});

initializeCatalog().catch(showLoadError);
