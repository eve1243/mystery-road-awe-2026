import { state, STORAGE_KEY_HYPOTHESIS } from "./state.js";
import { navigateTo } from "./router.js";
import { openEvidenceDetail } from "./evidence.js";

interface HypothesisDraft {
  suspectId: string;
  nature: string;
  evidenceIds: string[];
  confidence: string;
  explanation: string;
  alternative: string;
  savedAt: string;
}

export function renderWorkspace(): void {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

function renderBookmarksList(): void {
  const container = document.getElementById("bookmarksList");
  if (!container) return;
  const bookmarkedItems = state.allEvidence.filter(
    (evidence) => evidence.bookmarked
  );
  if (bookmarkedItems.length === 0) {
    container.innerHTML =
      "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }
  container.innerHTML = bookmarkedItems
    .map(
      (evidence) =>
        `<div class="mini-list-item"><strong>${evidence.id}</strong> &mdash; ${evidence.title} <button type="button" class="btn btn-small btn-secondary" data-open-evidence="${evidence.id}">Open</button></div>`
    )
    .join("");
  container
    .querySelectorAll<HTMLButtonElement>("[data-open-evidence]")
    .forEach((button) => {
      button.addEventListener("click", () => {
        navigateTo("evidence");
        setTimeout(
          () => openEvidenceDetail(button.dataset.openEvidence || ""),
          0
        );
      });
    });
}

function renderNotesList(): void {
  const container = document.getElementById("notesList");
  if (!container) return;
  const noteEntries = state.allEvidence.flatMap((evidence, index) => {
    const text = state.notesStore[evidence.id];
    return text
      ? [{ index, evidenceId: evidence.id, title: evidence.title, text }]
      : [];
  });
  if (noteEntries.length === 0) {
    container.innerHTML =
      "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }
  container.innerHTML = noteEntries
    .map(
      (entry) =>
        `<div class="mini-list-item"><strong>${entry.evidenceId}</strong> &mdash; ${entry.title}<div id="noteText-${entry.index}">${entry.text}</div></div>`
    )
    .join("");
}

export function populateHypothesisDropdowns(): void {
  const suspectSelect = document.getElementById(
    "hypSuspect"
  ) as HTMLSelectElement | null;
  const evidenceSelect = document.getElementById(
    "hypEvidence"
  ) as HTMLSelectElement | null;
  if (!suspectSelect || !evidenceSelect) return;
  const currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML = '<option value="">Select a person...</option>';
  for (const person of state.allPeople)
    suspectSelect.innerHTML += `<option value="${person.id}">${person.name}</option>`;
  suspectSelect.value = currentSuspect;
  evidenceSelect.innerHTML = state.allEvidence
    .map(
      (evidence) =>
        `<option value="${evidence.id}">${evidence.id} - ${evidence.title}</option>`
    )
    .join("");
}

export function saveHypothesis(): void {
  const draft: HypothesisDraft = {
    suspectId:
      (document.getElementById("hypSuspect") as HTMLSelectElement | null)
        ?.value || "",
    nature:
      (document.getElementById("hypNature") as HTMLSelectElement | null)
        ?.value || "",
    evidenceIds: getSelectedOptions(
      document.getElementById("hypEvidence") as HTMLSelectElement | null
    ),
    confidence:
      (document.getElementById("hypConfidence") as HTMLInputElement | null)
        ?.value || "50",
    explanation:
      (document.getElementById("hypExplanation") as HTMLTextAreaElement | null)
        ?.value || "",
    alternative:
      (document.getElementById("hypAlternative") as HTMLTextAreaElement | null)
        ?.value || "",
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (error) {
    console.error("Could not save hypothesis draft", error);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }
  const message = document.getElementById("hypothesisSavedMsg");
  if (message) {
    message.classList.remove("hidden");
    setTimeout(() => message.classList.add("hidden"), 2000);
  }
}

function getSelectedOptions(selectElement: HTMLSelectElement | null): string[] {
  if (!selectElement) return [];
  return Array.from(selectElement.options)
    .filter((option) => option.selected)
    .map((option) => option.value);
}

export function loadHypothesisFromStorage(): void {
  const raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;
  let draft: Partial<HypothesisDraft>;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isHypothesisDraft(parsed)) return;
    draft = parsed;
  } catch (error) {
    console.warn("Could not read stored hypothesis, starting empty", error);
    return;
  }
  const suspect = document.getElementById(
    "hypSuspect"
  ) as HTMLSelectElement | null;
  const nature = document.getElementById(
    "hypNature"
  ) as HTMLSelectElement | null;
  const confidence = document.getElementById(
    "hypConfidence"
  ) as HTMLInputElement | null;
  const confidenceValue = document.getElementById("hypConfidenceValue");
  const explanation = document.getElementById(
    "hypExplanation"
  ) as HTMLTextAreaElement | null;
  const alternative = document.getElementById(
    "hypAlternative"
  ) as HTMLTextAreaElement | null;
  if (suspect) suspect.value = draft.suspectId || "";
  if (nature) nature.value = draft.nature || "";
  if (confidence) confidence.value = draft.confidence || "50";
  if (confidenceValue) confidenceValue.textContent = draft.confidence || "50";
  if (explanation) explanation.value = draft.explanation || "";
  if (alternative) alternative.value = draft.alternative || "";
  const evidenceSelect = document.getElementById(
    "hypEvidence"
  ) as HTMLSelectElement | null;
  if (evidenceSelect) {
    for (const option of evidenceSelect.options)
      option.selected = draft.evidenceIds?.includes(option.value) || false;
  }
}

function isHypothesisDraft(value: unknown): value is HypothesisDraft {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return false;
  const draft = value as Record<string, unknown>;
  return (
    typeof draft.suspectId === "string" &&
    typeof draft.nature === "string" &&
    Array.isArray(draft.evidenceIds) &&
    draft.evidenceIds.every((id) => typeof id === "string") &&
    typeof draft.confidence === "string" &&
    typeof draft.explanation === "string" &&
    typeof draft.alternative === "string" &&
    typeof draft.savedAt === "string"
  );
}
