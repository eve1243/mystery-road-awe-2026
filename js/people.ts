import { state, type Person } from "./state.js";
import { navigateTo } from "./router.js";
import { renderEvidenceList } from "./evidence.js";
import { evidenceMentionsPerson } from "./utils.js";

type PeopleTab = "people" | "locations";

export function switchPeopleTab(tab: PeopleTab): void {
  state.currentPeopleTab = tab;
  const peoplePanel = document.getElementById("peoplePanel");
  const locationsPanel = document.getElementById("locationsPanel");
  const peopleTabBtn = document.getElementById("tabPeopleBtn");
  const locationsTabBtn = document.getElementById("tabLocationsBtn");
  if (!peoplePanel || !locationsPanel) return;

  const showingPeople = tab === "people";
  peoplePanel.classList.toggle("hidden", !showingPeople);
  locationsPanel.classList.toggle("hidden", showingPeople);
  peopleTabBtn?.classList.toggle("active", showingPeople);
  locationsTabBtn?.classList.toggle("active", !showingPeople);
}

function countEvidenceForPerson(person: Person): number {
  return state.allEvidence.filter((evidence) =>
    evidenceMentionsPerson(evidence, person)
  ).length;
}

export function renderPeople(): void {
  const container = document.getElementById("peoplePanel");
  if (!container) return;

  let html = "";
  for (const person of state.allPeople) {
    const count = countEvidenceForPerson(person);
    html += `<div class="person-card"><div class="person-card-header">`;
    html += `<img class="person-avatar" src="${person.avatar}" alt="Portrait of ${person.name}">`;
    html += `<div><h3>${person.name}</h3><div class="person-role">${person.role}</div></div></div>`;
    html += `<p><strong>Speciality:</strong> ${person.speciality}</p><ul>`;
    for (const responsibility of person.responsibilities)
      html += `<li>${responsibility}</li>`;
    html += `</ul><div class="person-statement">&ldquo;${person.statement}&rdquo;</div>`;
    html += `<p>${count} related evidence item${count === 1 ? "" : "s"} &mdash; <button type="button" class="evidence-count-link" data-person-id="${person.id}">view</button></p></div>`;
  }
  container.innerHTML = html;

  container
    .querySelectorAll<HTMLButtonElement>(".evidence-count-link")
    .forEach((link) => {
      link.addEventListener("click", () => {
        const personId = link.dataset.personId || "";
        const filterPersonSelect = document.getElementById(
          "filterPerson"
        ) as HTMLSelectElement | null;
        if (filterPersonSelect) filterPersonSelect.value = personId;
        navigateTo("evidence");
        setTimeout(renderEvidenceList, 0);
      });
    });
}

export function renderLocations(): void {
  const container = document.getElementById("locationsPanel");
  if (!container) return;

  let html = "";
  for (const location of state.allLocations) {
    html += `<div class="location-card"><h3>${location.id} &mdash; ${location.name}</h3>`;
    html += `<p>${location.description}</p><p><strong>Contains:</strong></p><ul>`;
    for (const item of location.contains) html += `<li>${item}</li>`;
    html += "</ul></div>";
  }
  container.innerHTML = html;
}
