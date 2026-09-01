// js/workspace.js
import { state, STORAGE_KEY_HYPOTHESIS } from './state.js';

export function renderWorkspace() {
  renderBookmarksList();
  renderNotesList();
  populateHypothesisDropdowns();
  loadHypothesisFromStorage();
}

export function renderBookmarksList() {
  var container = document.getElementById("bookmarksList");
  if (!container) return;

  var bookmarkedItems = state.allEvidence.filter(function (ev) {
    return ev.bookmarked;
  });

  if (bookmarkedItems.length === 0) {
    container.innerHTML = "<p>No bookmarked evidence yet. Bookmark items from the Evidence view.</p>";
    return;
  }

  var html = "";
  for (var i = 0; i < bookmarkedItems.length; i++) {
    var ev = bookmarkedItems[i];
    html += '<div class="mini-list-item"><strong>' + ev.id + "</strong> &mdash; " + ev.title +
      ' <button type="button" class="btn btn-small btn-secondary" data-open-evidence="' + ev.id + '">Open</button></div>';
  }
  container.innerHTML = html;

  var openButtons = container.querySelectorAll("[data-open-evidence]");
  for (var b = 0; b < openButtons.length; b++) {
    openButtons[b].addEventListener("click", function (e) {
      if (typeof window.navigateTo === 'function') window.navigateTo("evidence");
      var id = e.target.getAttribute("data-open-evidence");
      setTimeout(function () {
        if (typeof window.openEvidenceDetail === 'function') window.openEvidenceDetail(id);
      }, 0);
    });
  }
}

export function renderNotesList() {
  var container = document.getElementById("notesList");
  if (!container) return;

  var noteEntries = [];
  for (var i = 0; i < state.allEvidence.length; i++) {
    var note = state.notesStore[state.allEvidence[i].id];
    if (note) {
      noteEntries.push({ index: i, evidenceId: state.allEvidence[i].id, title: state.allEvidence[i].title, text: note });
    }
  }

  if (noteEntries.length === 0) {
    container.innerHTML = "<p>No notes yet. Add one from an evidence item's detail view.</p>";
    return;
  }

  var html = "";
  for (var n = 0; n < noteEntries.length; n++) {
    var entry = noteEntries[n];
    html += '<div class="mini-list-item"><strong>' + entry.evidenceId + "</strong> &mdash; " + entry.title;
    html += '<div id="noteText-' + entry.index + '">' + entry.text + "</div></div>";
  }
  container.innerHTML = html;
}

export function populateHypothesisDropdowns() {
  var suspectSelect = document.getElementById("hypSuspect");
  var evidenceSelect = document.getElementById("hypEvidence");
  if (!suspectSelect || !evidenceSelect) return;

  var currentSuspect = suspectSelect.value;
  suspectSelect.innerHTML = '<option value="">Select a person…</option>';
  for (var p = 0; p < state.allPeople.length; p++) {
    suspectSelect.innerHTML += '<option value="' + state.allPeople[p].id + '">' + state.allPeople[p].name + "</option>";
  }
  suspectSelect.value = currentSuspect;

  evidenceSelect.innerHTML = "";
  for (var i = 0; i < state.allEvidence.length; i++) {
    evidenceSelect.innerHTML += '<option value="' + state.allEvidence[i].id + '">' + state.allEvidence[i].id + " - " + state.allEvidence[i].title + "</option>";
  }
}

export function saveHypothesis() {
  var suspectElem = document.getElementById("hypSuspect");
  var natureElem = document.getElementById("hypNature");
  var evidenceElem = document.getElementById("hypEvidence");
  var confidenceElem = document.getElementById("hypConfidence");
  var explanationElem = document.getElementById("hypExplanation");
  var alternativeElem = document.getElementById("hypAlternative");

  var draft = {
    suspectId: suspectElem ? suspectElem.value : "",
    nature: natureElem ? natureElem.value : "",
    evidenceIds: evidenceElem ? getSelectedOptions(evidenceElem) : [],
    confidence: confidenceElem ? confidenceElem.value : 50,
    explanation: explanationElem ? explanationElem.value : "",
    alternative: alternativeElem ? alternativeElem.value : "",
    savedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(STORAGE_KEY_HYPOTHESIS, JSON.stringify(draft));
  } catch (err) {
    console.error("Could not save hypothesis draft", err);
    alert("Your hypothesis could not be saved to local storage.");
    return;
  }

  var msg = document.getElementById("hypothesisSavedMsg");
  if (msg) {
    msg.classList.remove("hidden");
    setTimeout(function () {
      msg.classList.add("hidden");
    }, 2000);
  }
}

export function getSelectedOptions(selectEl) {
  var result = [];
  for (var i = 0; i < selectEl.options.length; i++) {
    if (selectEl.options[i].selected) result.push(selectEl.options[i].value);
  }
  return result;
}

export function loadHypothesisFromStorage() {
  var raw = localStorage.getItem(STORAGE_KEY_HYPOTHESIS);
  if (!raw) return;

  var draft = JSON.parse(raw);

  var suspectElem = document.getElementById("hypSuspect");
  var natureElem = document.getElementById("hypNature");
  var confidenceElem = document.getElementById("hypConfidence");
  var confidenceValElem = document.getElementById("hypConfidenceValue");
  var explanationElem = document.getElementById("hypExplanation");
  var alternativeElem = document.getElementById("hypAlternative");

  if (suspectElem) suspectElem.value = draft.suspectId || "";
  if (natureElem) natureElem.value = draft.nature || "";
  if (confidenceElem) confidenceElem.value = draft.confidence || 50;
  if (confidenceValElem) confidenceValElem.textContent = draft.confidence || 50;
  if (explanationElem) explanationElem.value = draft.explanation || "";
  if (alternativeElem) alternativeElem.value = draft.alternative || "";

  var evidenceSelect = document.getElementById("hypEvidence");
  if (evidenceSelect) {
    var savedIds = draft.evidenceIds || [];
    for (var i = 0; i < evidenceSelect.options.length; i++) {
      evidenceSelect.options[i].selected = savedIds.indexOf(evidenceSelect.options[i].value) !== -1;
    }
  }
}