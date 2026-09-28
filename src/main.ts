import { loadAllData } from "../js/api.js";
import { navigateTo, handleHashChange } from "../js/router.js";
import {
  loadBookmarksFromStorage,
  loadNotesFromStorage,
  loadNoteAsync,
} from "../js/storage.js";
import {
  handleSearchInput,
  renderEvidenceList,
  clearFilters,
  handleSortChange,
  saveCurrentNote,
  closeEvidenceDetail,
  openEvidenceDetail,
} from "../js/evidence.js";
import { switchPeopleTab } from "../js/people.js";
import { renderTimeline } from "../js/timeline.js";
import { saveHypothesis } from "../js/workspace.js";

function setupEventListeners(): void {
  window.addEventListener("hashchange", handleHashChange);

  document.querySelectorAll<HTMLElement>(".nav-btn").forEach((button) => {
    button.addEventListener("click", () =>
      navigateTo(button.dataset.view || "dashboard")
    );
  });
  document.querySelectorAll<HTMLElement>("[data-nav]").forEach((button) => {
    button.addEventListener("click", () =>
      navigateTo(button.dataset.nav || "dashboard")
    );
  });

  document
    .getElementById("evidenceSearch")
    ?.addEventListener("input", handleSearchInput);
  [
    "filterType",
    "filterPerson",
    "filterLocation",
    "filterStatus",
    "filterRelevance",
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", renderEvidenceList);
  });
  document
    .getElementById("clearFiltersBtn")
    ?.addEventListener("click", clearFilters);
  document
    .getElementById("sortEvidence")
    ?.addEventListener("change", handleSortChange);
  document
    .getElementById("tabPeopleBtn")
    ?.addEventListener("click", () => switchPeopleTab("people"));
  document
    .getElementById("tabLocationsBtn")
    ?.addEventListener("click", () => switchPeopleTab("locations"));
  [
    "timelineOrder",
    "timelinePersonFilter",
    "timelineLocationFilter",
    "timelineTypeFilter",
  ].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", renderTimeline);
  });

  const confidence = document.getElementById(
    "hypConfidence"
  ) as HTMLInputElement | null;
  confidence?.addEventListener("input", () => {
    const display = document.getElementById("hypConfidenceValue");
    if (display) display.textContent = confidence.value;
  });
  document
    .getElementById("saveHypothesisBtn")
    ?.addEventListener("click", saveHypothesis);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(".modal-close-btn"))
      document.getElementById("quickViewModal")?.replaceChildren();
    const openFullButton = target.closest<HTMLElement>("[data-open-full]");
    if (openFullButton) {
      navigateTo("evidence");
      setTimeout(
        () => openEvidenceDetail(openFullButton.dataset.openFull || ""),
        0
      );
    }
    if (target.closest("[data-close-evidence-detail]")) closeEvidenceDetail();
    if (target.closest("[data-save-note]")) saveCurrentNote();
  });
}

function initApp(): void {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();
  void loadAllData().then(() => {
    handleHashChange();
    void loadNoteAsync("E01").then((firstNote) =>
      console.log("First note preview:", firstNote)
    );
  });
}

window.addEventListener("DOMContentLoaded", initApp);
