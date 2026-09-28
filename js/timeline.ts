import { state, type TimelineEvent } from "./state.js";
import { navigateTo } from "./router.js";
import { openEvidenceDetail } from "./evidence.js";
import { formatDate, findLocationById, findEvidenceById } from "./utils.js";

export function populateTimelineDropdowns(): void {
  const personSelect = document.getElementById(
    "timelinePersonFilter"
  ) as HTMLSelectElement | null;
  const locationSelect = document.getElementById(
    "timelineLocationFilter"
  ) as HTMLSelectElement | null;
  const typeSelect = document.getElementById(
    "timelineTypeFilter"
  ) as HTMLSelectElement | null;
  if (!personSelect || !locationSelect || !typeSelect) return;

  personSelect.innerHTML = '<option value="">All people</option>';
  for (const person of state.allPeople)
    personSelect.innerHTML += `<option value="${person.id}">${person.name}</option>`;
  locationSelect.innerHTML = '<option value="">All locations</option>';
  for (const location of state.allLocations)
    locationSelect.innerHTML += `<option value="${location.id}">${location.id}</option>`;

  const types = [...new Set(state.allTimeline.map((event) => event.type))];
  typeSelect.innerHTML = '<option value="">All event types</option>';
  for (const type of types)
    typeSelect.innerHTML += `<option value="${type}">${type}</option>`;
}

export function renderTimeline(): void {
  const container = document.getElementById("timelineContainer");
  if (!container) return;
  const order =
    (document.getElementById("timelineOrder") as HTMLSelectElement | null)
      ?.value || "asc";
  const personFilter =
    (
      document.getElementById(
        "timelinePersonFilter"
      ) as HTMLSelectElement | null
    )?.value || "";
  const locationFilter =
    (
      document.getElementById(
        "timelineLocationFilter"
      ) as HTMLSelectElement | null
    )?.value || "";
  const typeFilter =
    (document.getElementById("timelineTypeFilter") as HTMLSelectElement | null)
      ?.value || "";

  const events = state.allTimeline
    .filter(
      (event) =>
        (!personFilter || event.personIds.some((id) => id === personFilter)) &&
        (!locationFilter ||
          event.locationIds.some((id) => id === locationFilter)) &&
        (!typeFilter || event.type === typeFilter)
    )
    .slice()
    .sort((first, second) => {
      const difference =
        new Date(first.time).getTime() - new Date(second.time).getTime();
      return order === "desc" ? -difference : difference;
    });

  let html = "";
  for (const event of events) {
    html += `<div class="timeline-event certainty-${event.certainty}">`;
    html += `<div class="timeline-time">${formatDate(event.time)}&nbsp;&middot;&nbsp;<span class="badge badge-${certaintyBadgeClass(event.certainty)}">${event.certainty}</span></div>`;
    html += `<h3>${event.title}</h3><p>${event.description}</p>`;
    const locationNames = event.locationIds.map((locationId) => {
      const location = findLocationById(locationId);
      return location ? `${location.id} - ${location.name}` : locationId;
    });
    if (locationNames.length > 0)
      html += `<p class="evidence-meta">Location: ${locationNames.join(", ")}</p>`;
    for (const evidenceId of event.evidenceIds) {
      html += `<button type="button" class="evidence-link-btn" data-evidence-id="${evidenceId}">View ${evidenceId}</button>`;
    }
    html += "</div>";
  }
  container.innerHTML =
    events.length > 0
      ? html
      : "<p>No timeline events match the current filters.</p>";
  container
    .querySelectorAll<HTMLButtonElement>(".evidence-link-btn")
    .forEach((button) => {
      button.addEventListener("click", () =>
        openEvidenceModal(button.dataset.evidenceId || "")
      );
    });
}

function certaintyBadgeClass(certainty: string): string {
  if (certainty === "confirmed") return "reviewed";
  if (certainty === "contradictory") return "critical";
  if (certainty === "reported") return "flagged";
  return "unreviewed";
}

function openEvidenceModal(evidenceId: string): void {
  const evidence = findEvidenceById(evidenceId);
  if (!evidence) return;
  let modal = document.getElementById("quickViewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "quickViewModal";
    document.body.appendChild(modal);
  }
  modal.innerHTML = `<div class="modal-backdrop"><div class="modal-box"><button type="button" class="modal-close-btn" aria-label="Close">&times;</button><h3>${evidence.title}</h3><p class="evidence-meta">${evidence.id} &middot; ${evidence.type} &middot; ${formatDate(evidence.timestamp)}</p><p>${evidence.summary}</p><button type="button" class="btn btn-primary btn-small" data-open-full="${evidence.id}">Open full evidence</button></div></div>`;
  state.modalCloseListenerCount++;
  console.log(
    "modal opened, active close listeners:",
    state.modalCloseListenerCount
  );
  modal.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (
      target.classList.contains("modal-close-btn") ||
      target.classList.contains("modal-backdrop")
    )
      modal.innerHTML = "";
    const fullEvidenceId = target.dataset.openFull;
    if (fullEvidenceId) {
      modal.innerHTML = "";
      navigateTo("evidence");
      setTimeout(() => openEvidenceDetail(fullEvidenceId), 0);
    }
  });
}
