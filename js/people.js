// js/people.js
import { state } from './state.js';
import { evidenceMentionsPerson } from './utils.js';

export function switchPeopleTab(tab) {
  state.currentPeopleTab = tab;
  var peoplePanel = document.getElementById("peoplePanel");
  var locationsPanel = document.getElementById("locationsPanel");
  var peopleTabBtn = document.getElementById("tabPeopleBtn");
  var locationsTabBtn = document.getElementById("tabLocationsBtn");

  if (!peoplePanel || !locationsPanel) return;

  if (tab === "people") {
    peoplePanel.classList.remove("hidden");
    locationsPanel.classList.add("hidden");
    if (peopleTabBtn) peopleTabBtn.classList.add("active");
    if (locationsTabBtn) locationsTabBtn.classList.remove("active");
  } else {
    peoplePanel.classList.add("hidden");
    locationsPanel.classList.remove("hidden");
    if (peopleTabBtn) peopleTabBtn.classList.remove("active");
    if (locationsTabBtn) locationsTabBtn.classList.add("active");
  }
}

export function countEvidenceForPerson(person) {
  var count = 0;
  for (var i = 0; i < state.allEvidence.length; i++) {
    if (evidenceMentionsPerson(state.allEvidence[i], person)) count++;
  }
  return count;
}

export function renderPeople() {
  var container = document.getElementById("peoplePanel");
  if (!container) return;

  var html = "";
  for (var i = 0; i < state.allPeople.length; i++) {
    var person = state.allPeople[i];
    var count = countEvidenceForPerson(person);

    html += '<div class="person-card">';
    html += '<div class="person-card-header">';
    html += '<img class="person-avatar" src="' + person.avatar + '" alt="Portrait of ' + person.name + '">';
    html += "<div><h3>" + person.name + "</h3><div class=\"person-role\">" + person.role + "</div></div>";
    html += "</div>";
    html += "<p><strong>Speciality:</strong> " + person.speciality + "</p>";
    html += "<ul>";
    for (var r = 0; r < person.responsibilities.length; r++) {
      html += "<li>" + person.responsibilities[r] + "</li>";
    }
    html += "</ul>";
    html += '<div class="person-statement">&ldquo;' + person.statement + '&rdquo;</div>';
    html += "<p>" + count + " related evidence item" + (count === 1 ? "" : "s") + " &mdash; ";
    html += '<button type="button" class="evidence-count-link" data-person-id="' + person.id + '">view</button></p>';
    html += "</div>";
  }
  container.innerHTML = html;

  var links = container.querySelectorAll(".evidence-count-link");
  for (var l = 0; l < links.length; l++) {
    links[l].addEventListener("click", function (e) {
      var personId = e.target.getAttribute("data-person-id");
      var filterPersonSelect = document.getElementById("filterPerson");
      if (filterPersonSelect) filterPersonSelect.value = personId;

      if (typeof window.navigateTo === 'function') {
        window.navigateTo("evidence");
      }
      setTimeout(function () {
        if (typeof window.renderEvidenceList === 'function') {
          window.renderEvidenceList();
        }
      }, 0);
    });
  }
}

export function renderLocations() {
  var container = document.getElementById("locationsPanel");
  if (!container) return;

  var html = "";
  for (var i = 0; i < state.allLocations.length; i++) {
    var loc = state.allLocations[i];
    html += '<div class="location-card">';
    html += "<h3>" + loc.id + " &mdash; " + loc.name + "</h3>";
    html += "<p>" + loc.description + "</p>";
    html += "<p><strong>Contains:</strong></p><ul>";
    for (var c = 0; c < loc.contains.length; c++) {
      html += "<li>" + loc.contains[c] + "</li>";
    }
    html += "</ul></div>";
  }
  container.innerHTML = html;
}