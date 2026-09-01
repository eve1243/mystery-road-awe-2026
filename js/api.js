import { state } from "./state.js";

export function showLoadingOverlay(msg) {
  var overlay = document.getElementById("loadingOverlay");
  var text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
}

export function hideLoadingStep() {
  state.loadingStepsRemaining--;
  if (state.loadingStepsRemaining <= 0) {
    var overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

export function loadCorePeopleAndLocations() {
  return fetch("data/case.json").then(function (caseRes) {
    return caseRes.json().then(function (caseJson) {
      Object.assign(state.caseData, caseJson);

      return fetch("data/people.json").then(function (peopleRes) {
        return peopleRes.json().then(function (peopleJson) {
          state.allPeople.length = 0;
          state.allPeople.push.apply(state.allPeople, peopleJson);

          return fetch("data/locations.json").then(function (locationsRes) {
            return locationsRes.json().then(function (locationsJson) {
              state.allLocations.length = 0;
              state.allLocations.push.apply(state.allLocations, locationsJson);

              hideLoadingStep();
              if (typeof window.renderDashboard === 'function') window.renderDashboard();
              if (typeof window.populateAllDropdowns === 'function') window.populateAllDropdowns();
            });
          });
        });
      });
    });
  });
}

export function loadEvidenceData() {
  fetch("data/evidence.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      state.allEvidence.length = 0;
      state.allEvidence.push.apply(state.allEvidence, data);

      if (typeof window.applyStoredBookmarkFlags === 'function') window.applyStoredBookmarkFlags();
      state.filteredEvidence.length = 0;
      state.filteredEvidence.push.apply(state.filteredEvidence, state.allEvidence);

    
     if (typeof window.renderDashboard === 'function') window.renderDashboard();
      if (typeof window.populateAllDropdowns === 'function') window.populateAllDropdowns();
      if (state.currentPage === "evidence" && typeof window.renderEvidenceList === 'function') {
        window.renderEvidenceList();
      }
    })
    .catch(function (err) {
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

export function loadTimelineData() {
  return fetch("data/timeline.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      state.allTimeline.length = 0;
      state.allTimeline.push.apply(state.allTimeline, data);

      if (typeof window.renderDashboard === 'function') window.renderDashboard();
      if (state.currentPage === "timeline" && typeof window.renderTimeline === 'function') {
        window.renderTimeline();
      }
      if (typeof window.populateAllDropdowns === 'function') window.populateAllDropdowns();
    })
    .catch(function (err) {
      console.log("timeline load error", err);
    })
    .finally(function () {
      hideLoadingStep();
    });
}

export function loadAllData() {
  showLoadingOverlay("Loading case file…");
  state.loadingStepsRemaining = 2;
  return loadCorePeopleAndLocations().then(function () {
    loadEvidenceData();
    loadTimelineData();
  });
}

