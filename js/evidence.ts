import { state, type Evidence } from "./state.js";
import { renderDashboard } from "./dashboard.js";
import { populateTimelineDropdowns } from "./timeline.js";
import { populateHypothesisDropdowns } from "./workspace.js";
import {
  saveBookmarksToStorage,
  loadNoteForEvidence,
  saveNoteForEvidence,
} from "./storage.js";
import {
  findEvidenceById,
  findPersonById,
  findLocationById,
  evidenceMentionsPerson,
  formatDate,
  getStatusBadgeClass,
  getRelevanceBadgeClass,
} from "./utils.js";

export function populateAllDropdowns(): void {
  populateEvidenceDropdowns();
  populateTimelineDropdowns();
  populateHypothesisDropdowns();
}

function populateEvidenceDropdowns(): void {
  const typeSelect = document.getElementById(
    "filterType"
  ) as HTMLSelectElement | null;
  const personSelect = document.getElementById(
    "filterPerson"
  ) as HTMLSelectElement | null;
  const locationSelect = document.getElementById(
    "filterLocation"
  ) as HTMLSelectElement | null;
  if (!typeSelect || !personSelect || !locationSelect) return;

  const types = [
    ...new Set(
      state.allEvidence.map((evidence) => evidence.type.toLowerCase())
    ),
  ];
  typeSelect.innerHTML = '<option value="">All types</option>';
  for (const type of types)
    typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
  personSelect.innerHTML = '<option value="">All people</option>';
  for (const person of state.allPeople)
    personSelect.innerHTML += `<option value="${person.id}">${person.name}</option>`;
  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (const location of state.allLocations)
    locationSelect.innerHTML += `<option value="${location.id}">${location.id} - ${location.name}</option>`;
}

function getFilteredEvidence(): Evidence[] {
  const searchTerm = (
    (document.getElementById("evidenceSearch") as HTMLInputElement | null)
      ?.value || ""
  )
    .toLowerCase()
    .trim();
  const typeValue =
    (document.getElementById("filterType") as HTMLSelectElement | null)
      ?.value || "";
  const personValue =
    (document.getElementById("filterPerson") as HTMLSelectElement | null)
      ?.value || "";
  const locationValue =
    (document.getElementById("filterLocation") as HTMLSelectElement | null)
      ?.value || "";
  const statusValue =
    (document.getElementById("filterStatus") as HTMLSelectElement | null)
      ?.value || "";
  const relevanceValue =
    (document.getElementById("filterRelevance") as HTMLSelectElement | null)
      ?.value || "";

  const results = state.allEvidence.filter((item) => {
    const haystack =
      `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
    if (searchTerm && !haystack.includes(searchTerm)) return false;
    if (typeValue && item.type.toLowerCase() !== typeValue) return false;
    if (personValue) {
      const person = findPersonById(personValue);
      if (!person || !evidenceMentionsPerson(item, person)) return false;
    }
    if (locationValue && !item.locationIds.some((id) => id === locationValue))
      return false;
    if (statusValue && item.status.toLowerCase() !== statusValue) return false;
    if (relevanceValue && item.relevance.toLowerCase() !== relevanceValue)
      return false;
    return true;
  });
  state.filteredEvidence = results;
  return results;
}

export function renderEvidenceList(): void {
  const container = document.getElementById("evidenceList");
  if (!container) return;
  const loadingIndicator = document.getElementById("evidenceLoadingIndicator");
  if (state.evidenceViewLoading) {
    loadingIndicator?.classList.remove("hidden");
    container.innerHTML = "";
    return;
  }
  loadingIndicator?.classList.add("hidden");
  const results = getFilteredEvidence();
  container.innerHTML =
    results.length === 0
      ? "<p>No evidence matches the current filters.</p>"
      : results.map(renderEvidenceCardHTML).join("");
  container.removeEventListener("click", handleEvidenceListClick);
  container.addEventListener("click", handleEvidenceListClick);
}

function renderEvidenceCardHTML(evidence: Evidence): string {
  const isBookmarked = state.bookmarks.includes(evidence.id);
  let html = `<div class="evidence-card" data-id="${evidence.id}">`;
  html += `<button class="bookmark-btn ${isBookmarked ? "active" : ""}" data-action="bookmark" data-id="${evidence.id}" aria-label="Toggle bookmark for ${evidence.title}"><span class="bookmark-icon">${isBookmarked ? "★" : "☆"}</span></button>`;
  html += `<h3>${evidence.title}</h3><div class="evidence-meta">${evidence.id} &middot; ${evidence.type} &middot; ${formatDate(evidence.timestamp)}</div>`;
  html += `<div class="evidence-summary">${evidence.summary}</div>`;
  if (evidence.tags.includes("critical"))
    html += '<span class="badge badge-critical">Critical</span>';
  html += `<span class="badge ${getStatusBadgeClass(evidence.status)}">${evidence.status}</span>`;
  html += `<span class="badge ${getRelevanceBadgeClass(evidence.relevance)}">${evidence.relevance}</span><div>`;
  for (const tag of evidence.tags)
    html += `<span class="tag-chip">${tag}</span>`;
  return `${html}</div></div>`;
}

function handleEvidenceListClick(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.dataset.action === "bookmark") {
    event.stopPropagation();
    handleBookmarkClick(target.dataset.id || "");
    return;
  }
  const card = target.closest<HTMLElement>(".evidence-card");
  if (card) openEvidenceDetail(card.dataset.id || "");
}

export function handleBookmarkClick(evidenceId: string): void {
  const evidence = findEvidenceById(evidenceId);
  if (!evidence) return;
  if (!state.bookmarks.includes(evidenceId)) {
    state.bookmarks.push(evidenceId);
    evidence.bookmarked = true;
  } else {
    state.bookmarks = state.bookmarks.filter((id) => id !== evidenceId);
    evidence.bookmarked = false;
  }
  saveBookmarksToStorage();
  if (state.currentPage === "evidence") renderEvidenceList();
}

export function applyStoredBookmarkFlags(): void {
  for (const evidence of state.allEvidence)
    evidence.bookmarked = state.bookmarks.includes(evidence.id);
}

export function handleSortChange(): void {
  const sortValue =
    (document.getElementById("sortEvidence") as HTMLSelectElement | null)
      ?.value || "";
  state.filteredEvidence.sort((first, second) => {
    if (sortValue === "title-asc")
      return first.title.localeCompare(second.title);
    if (sortValue === "title-desc")
      return second.title.localeCompare(first.title);
    const difference =
      new Date(first.timestamp).getTime() -
      new Date(second.timestamp).getTime();
    return sortValue === "date-asc" ? difference : -difference;
  });
  renderEvidenceList();
}

export function clearFilters(): void {
  [
    "evidenceSearch",
    "filterType",
    "filterPerson",
    "filterLocation",
    "filterStatus",
    "filterRelevance",
  ].forEach((id) => {
    const element = document.getElementById(id) as
      HTMLInputElement | HTMLSelectElement | null;
    if (element) element.value = "";
  });
  renderEvidenceList();
}

function simulateAsyncSearch(term: string): Promise<string> {
  return new Promise((resolve) => setTimeout(() => resolve(term), 300));
}

let latestSearchRequestId = 0;
export function handleSearchInput(event: Event): void {
  const target = event.target;
  if (!(target instanceof HTMLInputElement)) return;
  const requestId = ++latestSearchRequestId;
  void simulateAsyncSearch(target.value).then(() => {
    if (requestId === latestSearchRequestId) renderEvidenceList();
  });
}

export function openEvidenceDetail(evidenceId: string): void {
  const evidence = findEvidenceById(evidenceId);
  if (!evidence) return;
  state.selectedEvidence = evidence;
  const section = document.getElementById("evidenceDetailSection");
  if (!section) return;
  section.classList.remove("hidden");
  renderEvidenceDetail(evidence);
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function closeEvidenceDetail(): void {
  const section = document.getElementById("evidenceDetailSection");
  if (!section) return;
  section.classList.add("hidden");
  section.innerHTML = "";
  state.selectedEvidence = null;
}

export function renderEvidenceDetail(evidence: Evidence): void {
  const section = document.getElementById("evidenceDetailSection");
  if (!section) return;
  const personNames = evidence.personIds.map(
    (id) => findPersonById(id)?.name || id
  );
  const locationNames = evidence.locationIds.map((id) => {
    const location = findLocationById(id);
    return location ? `${location.id} - ${location.name}` : id;
  });
  const tagsHtml = evidence.tags
    .map((tag) => `<span class="tag-chip">${tag}</span>`)
    .join("");
  const storedNote = loadNoteForEvidence(evidence.id);
  let html = `<div class="evidence-detail-header"><div><h2>${evidence.title}</h2><div class="evidence-meta">${evidence.id} &middot; ${evidence.type} &middot; ${formatDate(evidence.timestamp)}</div></div><button type="button" class="btn btn-secondary btn-small" data-close-evidence-detail="true">Close</button></div>`;
  if (evidence.tags.includes("critical"))
    html +=
      '<div class="warning-banner">This item is tagged as critical evidence.</div>';
  html += `<div class="detail-field"><strong>Summary</strong>${evidence.summary}</div><div class="evidence-detail-content">${evidence.content}</div>`;
  html += `<div class="detail-field"><strong>Related people</strong>${personNames.join(", ")}</div><div class="detail-field"><strong>Related locations</strong>${locationNames.join(", ")}</div><div class="detail-field"><strong>Tags</strong>${tagsHtml}</div>`;
  html += `<div class="detail-field"><strong>Review status</strong><select id="detailStatusSelect">${statusOptionHTML(evidence.status, "unreviewed", "Unreviewed")}${statusOptionHTML(evidence.status, "reviewed", "Reviewed")}${statusOptionHTML(evidence.status, "flagged", "Flagged")}</select></div>`;
  html += `<div class="detail-field"><strong>Relevance</strong><select id="detailRelevanceSelect">${statusOptionHTML(evidence.relevance, "unknown", "Unknown")}${statusOptionHTML(evidence.relevance, "relevant", "Relevant")}${statusOptionHTML(evidence.relevance, "irrelevant", "Irrelevant")}</select></div>`;
  html += `<div class="detail-field"><strong>Investigator note</strong><textarea id="evidenceNoteInput" class="note-textarea" rows="3" data-evidence-id="${evidence.id}" placeholder="Add a private note about this evidence...">${storedNote}</textarea><button type="button" class="btn btn-primary btn-small" style="margin-top:6px;" data-save-note="true">Save note</button></div><div class="detail-field"><strong>Note preview</strong><div id="notePreview">${storedNote}</div></div>`;
  section.innerHTML = html;
  const statusSelect = document.getElementById(
    "detailStatusSelect"
  ) as HTMLSelectElement | null;
  const relevanceSelect = document.getElementById(
    "detailRelevanceSelect"
  ) as HTMLSelectElement | null;
  statusSelect?.addEventListener("change", () => {
    evidence.status = statusSelect.value;
    renderEvidenceDetail(evidence);
    renderDashboard();
    if (state.viewRendered.evidence) renderEvidenceList();
  });
  relevanceSelect?.addEventListener("change", () => {
    evidence.relevance = relevanceSelect.value;
    renderEvidenceDetail(evidence);
    renderDashboard();
    if (state.viewRendered.evidence) renderEvidenceList();
  });
}

function statusOptionHTML(
  current: string,
  value: string,
  label: string
): string {
  return `<option value="${value}"${current.toLowerCase() === value ? " selected" : ""}>${label}</option>`;
}

export function saveCurrentNote(): void {
  const textarea = document.getElementById(
    "evidenceNoteInput"
  ) as HTMLTextAreaElement | null;
  if (!textarea) return;
  const evidenceId = textarea.dataset.evidenceId;
  if (!evidenceId) return;
  saveNoteForEvidence(evidenceId, textarea.value);
  const preview = document.getElementById("notePreview");
  if (preview) preview.innerHTML = textarea.value;
}
