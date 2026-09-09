import { state } from "./state.js";
import { renderDashboard } from "./dashboard.js";
import { renderEvidenceList } from "./evidence.js";
import { renderPeople, renderLocations } from "./people.js";
import { renderTimeline } from "./timeline.js";
import { renderWorkspace } from "./workspace.js";

export function navigateTo(viewName) {
  window.location.hash = viewName;
}

export function handleHashChange() {
  const hash = window.location.hash.replace("#", "");
  const validViews = ["dashboard", "evidence", "people", "timeline", "workspace"];
  if (validViews.indexOf(hash) === -1) {
    hash = "dashboard";
  }
  state.currentPage = hash;

  const sections = document.querySelectorAll(".view");
  for (let i = 0; i < sections.length; i++) {
    sections[i].classList.remove("active");
  }

  const targetView = document.getElementById("view-" + hash);
  if (targetView) {
    targetView.classList.add("active");
  }
 
  const navButtons = document.querySelectorAll(".nav-btn");
  for (let n = 0; n < navButtons.length; n++) {
    navButtons[n].classList.remove("active");
    if (navButtons[n].getAttribute("data-view") === hash) {
      navButtons[n].classList.add("active");
    }
  }

  if (hash === "dashboard" && !state.viewRendered.dashboard) {
    renderDashboard();
    state.viewRendered.dashboard = true;
  } else if (hash === "evidence" && !state.viewRendered.evidence) {
    renderEvidenceList();
    state.viewRendered.evidence = true;
  } else if (hash === "people" && !state.viewRendered.people) {
    renderPeople();
    renderLocations();
    state.viewRendered.people = true;
  } else if (hash === "timeline" && !state.viewRendered.timeline) {
    renderTimeline();
    state.viewRendered.timeline = true;
  } else if (hash === "workspace") {
    renderWorkspace();
  }
}
