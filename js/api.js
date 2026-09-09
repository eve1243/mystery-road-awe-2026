import { state } from "./state.js";
import { renderDashboard } from "./dashboard.js";
import { populateAllDropdowns, renderEvidenceList, applyStoredBookmarkFlags } from "./evidence.js";
import { renderTimeline } from "./timeline.js";

 function showLoadingOverlay(msg) {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");
  if (text) text.textContent = msg;
  if (overlay) overlay.classList.remove("hidden");
}

 function hideLoadingStep() {
  state.loadingStepsRemaining--;
  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

export async function loadCorePeopleAndLocations() {
  const caseRes = await fetch("data/case.json");
  const caseJson = await caseRes.json();
  Object.assign(state.caseData, caseJson);

  const peopleRes = await fetch("data/people.json");
  const peopleJson = await peopleRes.json();
  state.allPeople.length = 0;
  state.allPeople.push.apply(state.allPeople, peopleJson);

  const locationsRes = await fetch("data/locations.json");
  const locationsJson = await locationsRes.json();
  state.allLocations.length = 0;
  state.allLocations.push.apply(state.allLocations, locationsJson);

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

export function loadEvidenceData() {
  return fetch("data/evidence.json")
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      state.allEvidence.length = 0;
      state.allEvidence.push.apply(state.allEvidence, data);

      applyStoredBookmarkFlags();
      state.filteredEvidence.length = 0;
      state.filteredEvidence.push.apply(state.filteredEvidence, state.allEvidence);
      state.evidenceViewLoading = false;

      renderDashboard();
      populateAllDropdowns();
      if (state.currentPage === "evidence") {
        renderEvidenceList();
      }
    })
    .catch(function (err) {
      state.evidenceViewLoading = false;
      console.error("Failed to load evidence.json", err);
      alert("Evidence could not be loaded. Some views may be incomplete.");
    });
}

export async function loadTimelineData() {
  try {
    const res = await fetch("data/timeline.json");
    const data = await res.json();
    state.allTimeline.length = 0;
    state.allTimeline.push.apply(state.allTimeline, data);

    renderDashboard();
    if (state.currentPage === "timeline") {
      renderTimeline();
    }
    populateAllDropdowns();
  } catch (err) {
    console.log("timeline load error", err);
  } finally {
    hideLoadingStep();
  }
}

export async function loadAllData() {
  showLoadingOverlay("Loading case file…");
  state.loadingStepsRemaining = 2;
  await loadCorePeopleAndLocations();
  await Promise.all([loadEvidenceData(), loadTimelineData()]);
}

