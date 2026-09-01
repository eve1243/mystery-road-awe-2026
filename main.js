// js/main.js
import { loadAllData } from './js/api.js';
import { navigateTo, handleHashChange } from './js/router.js';
import { 
  loadBookmarksFromStorage, 
  loadNotesFromStorage, 
  loadNoteAsync, 
  saveBookmarksToStorage, 
  saveNoteForEvidence, 
  loadNoteForEvidence 
} from './js/storage.js';

import * as dashboardView from './js/dashboard.js';
import * as evidenceView from './js/evidence.js';
import * as peopleView from './js/people.js';
import * as timelineView from './js/timeline.js';
import * as workspaceView from './js/workspace.js';

// Funktionen am Window-Objekt registrieren, damit HTML-Event-Attribute (z. B. onclick) sie finden
Object.assign(window, dashboardView);
Object.assign(window, evidenceView);
Object.assign(window, peopleView);
Object.assign(window, timelineView);
Object.assign(window, workspaceView);

window.navigateTo = navigateTo;
window.handleHashChange = handleHashChange;

// Storage-Helfer global bereitstellen
window.saveBookmarksToStorage = saveBookmarksToStorage;
window.saveNoteForEvidence = saveNoteForEvidence;
window.loadNoteForEvidence = loadNoteForEvidence;

function setupEventListeners() {
  window.addEventListener("hashchange", handleHashChange);

  var navButtons = document.querySelectorAll(".nav-btn");
  for (var i = 0; i < navButtons.length; i++) {
    (function (btn) {
      btn.addEventListener("click", function () {
        var targetView = btn.getAttribute("data-view");
        console.log("nav clicked:", targetView);
      });
    })(navButtons[i]);
  }

  var evidenceSearch = document.getElementById("evidenceSearch");
  if (evidenceSearch) evidenceSearch.addEventListener("input", evidenceView.handleSearchInput);

  var filterType = document.getElementById("filterType");
  if (filterType) filterType.addEventListener("change", evidenceView.renderEvidenceList);

  var filterPerson = document.getElementById("filterPerson");
  if (filterPerson) filterPerson.addEventListener("change", evidenceView.renderEvidenceList);

  var filterLocation = document.getElementById("filterLocation");
  if (filterLocation) filterLocation.addEventListener("change", evidenceView.renderEvidenceList);

  var filterStatus = document.getElementById("filterStatus");
  if (filterStatus) {
    filterStatus.addEventListener("change", evidenceView.renderEvidenceList);
    filterStatus.setAttribute("onchange", "renderEvidenceList()");
  }

  var filterRelevance = document.getElementById("filterRelevance");
  if (filterRelevance) filterRelevance.addEventListener("change", evidenceView.renderEvidenceList);

  var clearFiltersBtn = document.getElementById("clearFiltersBtn");
  if (clearFiltersBtn) clearFiltersBtn.addEventListener("click", evidenceView.clearFilters);

  var timelineOrder = document.getElementById("timelineOrder");
  if (timelineOrder) timelineOrder.addEventListener("change", timelineView.renderTimeline);

  var timelinePersonFilter = document.getElementById("timelinePersonFilter");
  if (timelinePersonFilter) timelinePersonFilter.addEventListener("change", timelineView.renderTimeline);

  var timelineLocationFilter = document.getElementById("timelineLocationFilter");
  if (timelineLocationFilter) timelineLocationFilter.addEventListener("change", timelineView.renderTimeline);

  var timelineTypeFilter = document.getElementById("timelineTypeFilter");
  if (timelineTypeFilter) timelineTypeFilter.addEventListener("change", timelineView.renderTimeline);

  var hypConfidence = document.getElementById("hypConfidence");
  if (hypConfidence) {
    hypConfidence.addEventListener("input", function (e) {
      var valDisplay = document.getElementById("hypConfidenceValue");
      if (valDisplay) valDisplay.textContent = e.target.value;
    });
  }
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
window.addEventListener("hashchange", handleHashChange);