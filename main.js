// js/main.js
import { loadAllData } from './js/api.js';
import { navigateTo, handleHashChange } from './js/router.js';
import { loadBookmarksFromStorage, loadNotesFromStorage, loadNoteAsync } from './js/storage.js';
import {
  handleSearchInput,
  renderEvidenceList,
  clearFilters,
  handleSortChange,
  saveCurrentNote,
  closeEvidenceDetail,
  openEvidenceDetail
} from './js/evidence.js';
import { switchPeopleTab } from './js/people.js';
import { renderTimeline } from './js/timeline.js';
import { saveHypothesis } from './js/workspace.js';


function setupEventListeners() {
  window.addEventListener("hashchange", handleHashChange);

  const navButtons = document.querySelectorAll(".nav-btn");
  for (let i = 0; i < navButtons.length; i++) {
    navButtons[i].addEventListener("click", function () {
      const targetView = this.getAttribute("data-view");
      navigateTo(targetView);
    });
  }

  const navShortcutButtons = document.querySelectorAll("[data-nav]");
  for (let j = 0; j < navShortcutButtons.length; j++) {
    navShortcutButtons[j].addEventListener("click", function () {
      navigateTo(this.getAttribute("data-nav"));
    });
  }

  const evidenceSearch = document.getElementById("evidenceSearch");
  if (evidenceSearch) evidenceSearch.addEventListener("input", handleSearchInput);

  const filterType = document.getElementById("filterType");
  if (filterType) filterType.addEventListener("change", renderEvidenceList);

  const filterPerson = document.getElementById("filterPerson");
  if (filterPerson) filterPerson.addEventListener("change", renderEvidenceList);

  const filterLocation = document.getElementById("filterLocation");
  if (filterLocation) filterLocation.addEventListener("change", renderEvidenceList);

  const filterStatus = document.getElementById("filterStatus");
  if (filterStatus) filterStatus.addEventListener("change", renderEvidenceList);

  const filterRelevance = document.getElementById("filterRelevance");
  if (filterRelevance) filterRelevance.addEventListener("change", renderEvidenceList);

  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", clearFilters);

  const sortEvidence = document.getElementById("sortEvidence");
  if (sortEvidence) sortEvidence.addEventListener("change", handleSortChange);

  const peopleTabBtn = document.getElementById("tabPeopleBtn");
  if (peopleTabBtn) peopleTabBtn.addEventListener("click", function () { switchPeopleTab("people"); });

  const locationsTabBtn = document.getElementById("tabLocationsBtn");
  if (locationsTabBtn) locationsTabBtn.addEventListener("click", function () { switchPeopleTab("locations"); });

  const timelineOrder = document.getElementById("timelineOrder");
  if (timelineOrder) timelineOrder.addEventListener("change", renderTimeline);

  const timelinePersonFilter = document.getElementById("timelinePersonFilter");
  if (timelinePersonFilter) timelinePersonFilter.addEventListener("change", renderTimeline);

  const timelineLocationFilter = document.getElementById("timelineLocationFilter");
  if (timelineLocationFilter) timelineLocationFilter.addEventListener("change", renderTimeline);

  const timelineTypeFilter = document.getElementById("timelineTypeFilter");
  if (timelineTypeFilter) timelineTypeFilter.addEventListener("change", renderTimeline);

  const hypConfidence = document.getElementById("hypConfidence");
  if (hypConfidence) {
    hypConfidence.addEventListener("input", (e) => {
      const valDisplay = document.getElementById("hypConfidenceValue");
      if (valDisplay) valDisplay.textContent = e.currentTarget.value;
    });
  }

  const saveHypothesisBtn = document.getElementById("saveHypothesisBtn");
  if (saveHypothesisBtn) saveHypothesisBtn.addEventListener("click", saveHypothesis);

  document.addEventListener("click", function (event) {
    const closeButton = event.target.closest(".modal-close-btn");
    if (closeButton) {
      const modal = document.getElementById("quickViewModal");
      if (modal) modal.innerHTML = "";
    }

    const openEvidenceButton = event.target.closest("[data-open-full]");
    if (openEvidenceButton) {
      const evidenceId = openEvidenceButton.getAttribute("data-open-full");
      navigateTo("evidence");
      setTimeout(function () {
        openEvidenceDetail(evidenceId);
      }, 0);
    }

    const closeEvidenceDetailBtn = event.target.closest("[data-close-evidence-detail]");
    if (closeEvidenceDetailBtn) {
      closeEvidenceDetail();
    }

    const saveNoteBtn = event.target.closest("[data-save-note]");
    if (saveNoteBtn) {
      saveCurrentNote();
    }
  });
}

function initApp() {
  loadBookmarksFromStorage();
  loadNotesFromStorage();
  setupEventListeners();

  loadAllData().then(function () {
    handleHashChange();
    loadNoteAsync("E01").then(function (firstNote) {
      console.log("First note preview:", firstNote);
    });
  });
}

window.addEventListener("DOMContentLoaded", initApp);