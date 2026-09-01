import {state} from "./state.js";


export function navigateTo(viewName) {
  window.location.hash = viewName;
  // handleHashChange() will pick this up via the hashchange listener
}

export function handleHashChange() {
  var hash = window.location.hash.replace("#", "");
  var validViews = ["dashboard", "evidence", "people", "timeline", "workspace"];
  if (validViews.indexOf(hash) === -1) {
    hash = "dashboard";
  }
  state.currentPage = hash;

  var sections = document.querySelectorAll(".view");
  for (var i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }

  var targetView = document.getElementById("view-" + hash);
  if (targetView) {
    targetView.classList.add("active");
  }
 
  var navButtons = document.querySelectorAll(".nav-btn");
  for (var n = 0; n < navButtons.length; n++) {
    navButtons[n].classList.remove("active");
    if (navButtons[n].getAttribute("data-view") === hash) {
      navButtons[n].classList.add("active");
    }
  }


  if (hash === "dashboard" && !state.viewRendered.dashboard) {
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
    state.viewRendered.dashboard = true;
  } else if (hash === "evidence" && !state.viewRendered.evidence) {
    if (typeof window.renderEvidenceList === 'function') window.renderEvidenceList();
    state.viewRendered.evidence = true;
  } else if (hash === "people" && !state.viewRendered.people) {
    if (typeof window.renderPeople === 'function') window.renderPeople();
    if (typeof window.renderLocations === 'function') window.renderLocations();
    state.viewRendered.people = true;
  } else if (hash === "timeline" && !state.viewRendered.timeline) {
    if (typeof window.renderTimeline === 'function') window.renderTimeline();
    state.viewRendered.timeline = true;
  } else if (hash === "workspace") {
    // workspace is cheap enough that it always re-renders
    if (typeof window.renderWorkspace === 'function') window.renderWorkspace();
  }
}
