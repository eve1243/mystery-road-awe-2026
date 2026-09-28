import {
  applyStoredBookmarkFlags,
  populateAllDropdowns,
  renderEvidenceList,
} from "./evidence.js";
import { renderDashboard } from "./dashboard.js";
import { renderTimeline } from "./timeline.js";
import {
  type CaseData,
  type Evidence,
  type Location,
  type Person,
  type TimelineEvent,
  state,
} from "./state.js";

function showLoadingOverlay(message: string): void {
  const overlay = document.getElementById("loadingOverlay");
  const text = document.getElementById("loadingText");
  if (text) text.textContent = message;
  if (overlay) overlay.classList.remove("hidden");
}

function hideLoadingStep(): void {
  state.loadingStepsRemaining--;
  if (state.loadingStepsRemaining <= 0) {
    const overlay = document.getElementById("loadingOverlay");
    if (overlay) overlay.classList.add("hidden");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(isString);
}

function assertData<T>(
  value: unknown,
  isExpected: (value: unknown) => value is T,
  fileName: string
): T {
  if (!isExpected(value)) throw new Error(`Invalid data shape in ${fileName}`);
  return value;
}

function isCaseData(value: unknown): value is CaseData {
  return (
    isRecord(value) &&
    [
      "caseId",
      "title",
      "subtitle",
      "status",
      "opened",
      "summary",
      "location",
      "leadInvestigator",
      "notes",
    ].every((key) => isString(value[key]))
  );
}

function isPerson(value: unknown): value is Person {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.role) &&
    isString(value.speciality) &&
    isStringArray(value.responsibilities) &&
    isString(value.statement) &&
    isString(value.background) &&
    isString(value.avatar)
  );
}

function isLocation(value: unknown): value is Location {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isString(value.description) &&
    isStringArray(value.contains)
  );
}

function isEvidence(value: unknown): value is Evidence {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.type) &&
    isString(value.title) &&
    isString(value.timestamp) &&
    isString(value.summary) &&
    isString(value.content) &&
    isStringArray(value.personIds) &&
    isStringArray(value.locationIds) &&
    isStringArray(value.tags) &&
    isString(value.status) &&
    isString(value.relevance)
  );
}

function isTimelineEvent(value: unknown): value is TimelineEvent {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.time) &&
    isString(value.title) &&
    isString(value.description) &&
    isString(value.type) &&
    isString(value.certainty) &&
    isStringArray(value.personIds) &&
    isStringArray(value.locationIds) &&
    isStringArray(value.evidenceIds)
  );
}

async function fetchJson<T>(
  fileName: string,
  isExpected: (value: unknown) => value is T
): Promise<T> {
  const response = await fetch(`data/${fileName}`);
  if (!response.ok)
    throw new Error(`${fileName} returned HTTP ${response.status}`);
  const value: unknown = await response.json();
  return assertData(value, isExpected, fileName);
}

export async function loadCorePeopleAndLocations(): Promise<void> {
  const caseData = await fetchJson("case.json", isCaseData);
  Object.assign(state.caseData, caseData);

  const people = await fetchJson(
    "people.json",
    (value): value is Person[] => Array.isArray(value) && value.every(isPerson)
  );
  state.allPeople.length = 0;
  state.allPeople.push(...people);

  const locations = await fetchJson(
    "locations.json",
    (value): value is Location[] =>
      Array.isArray(value) && value.every(isLocation)
  );
  state.allLocations.length = 0;
  state.allLocations.push(...locations);

  hideLoadingStep();
  renderDashboard();
  populateAllDropdowns();
}

export async function loadEvidenceData(): Promise<void> {
  try {
    const evidence = await fetchJson(
      "evidence.json",
      (value): value is Evidence[] =>
        Array.isArray(value) && value.every(isEvidence)
    );
    state.allEvidence.length = 0;
    state.allEvidence.push(...evidence);

    applyStoredBookmarkFlags();
    state.filteredEvidence.length = 0;
    state.filteredEvidence.push(...state.allEvidence);
    state.evidenceViewLoading = false;

    renderDashboard();
    populateAllDropdowns();
    if (state.currentPage === "evidence") renderEvidenceList();
  } catch (error) {
    state.evidenceViewLoading = false;
    console.error("Failed to load evidence.json", error);
    alert("Evidence could not be loaded. Some views may be incomplete.");
  }
}

export async function loadTimelineData(): Promise<void> {
  try {
    const timeline = await fetchJson(
      "timeline.json",
      (value): value is TimelineEvent[] =>
        Array.isArray(value) && value.every(isTimelineEvent)
    );
    state.allTimeline.length = 0;
    state.allTimeline.push(...timeline);

    renderDashboard();
    if (state.currentPage === "timeline") renderTimeline();
    populateAllDropdowns();
  } catch (error) {
    console.error("Timeline load error", error);
  } finally {
    hideLoadingStep();
  }
}

export async function loadAllData(): Promise<void> {
  showLoadingOverlay("Loading case file...");
  state.loadingStepsRemaining = 2;
  await loadCorePeopleAndLocations();
  await Promise.all([loadEvidenceData(), loadTimelineData()]);
}
