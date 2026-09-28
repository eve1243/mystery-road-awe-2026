import { state } from "./state.js";
import { renderDashboard } from "./dashboard.js";
import { renderEvidenceList } from "./evidence.js";
import { renderPeople, renderLocations } from "./people.js";
import { renderTimeline } from "./timeline.js";
import { renderWorkspace } from "./workspace.js";

type ViewName = "dashboard" | "evidence" | "people" | "timeline" | "workspace";
const validViews: ViewName[] = [
  "dashboard",
  "evidence",
  "people",
  "timeline",
  "workspace",
];

export function navigateTo(viewName: string | null): void {
  window.location.hash = viewName || "dashboard";
}

export function handleHashChange(): void {
  const requestedView = window.location.hash.replace("#", "");
  const hash: ViewName = validViews.includes(requestedView as ViewName)
    ? (requestedView as ViewName)
    : "dashboard";
  state.currentPage = hash;

  document
    .querySelectorAll<HTMLElement>(".view")
    .forEach((section) => section.classList.remove("active"));
  document.getElementById(`view-${hash}`)?.classList.add("active");
  document.querySelectorAll<HTMLElement>(".nav-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === hash);
  });

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
