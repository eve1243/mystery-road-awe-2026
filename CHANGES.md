# Protokoll & Reflexion: Modulierung und Refactoring

# Demo 1

## 1. Durchgeführte Schritte & Notes

* Einen Ordner für die Module erstellt.
* Nach den Überschriften die Module erstellt.
* Einstiegspunkt der Anwendung auf `main.js` ändern.
* Man kann importierte Variable nicht neu zuweisen, hatte Fehler in `api.js` bei z. B.: `caseData = caseJson` genauso muss alles von `state......` importiert werden.
* Hatte einen Fehler beim Start, weil ich die imports falsch gemacht habe. `import * as state from ...` geht nicht, weil `state` ein Modulname ist und schreibgeschützt ist, habe ein Object `state` erstellt und daraus kann man importieren. --> Object Mutation
* Hab daweil das `if (typeof window.renderDashboard === 'function') { window.renderDashboard(); }`, weil ich noch nicht alle Module sauber getrennt habe und so manchmal dann nicht weiß, ob es global verfügbar ist.
* Hatte dann einen Fehler beim Modulieren, weil im `index` alte globale Funktionen erwartet werden, die ich dann noch ändern muss, damit alles geht. Die `onclick`-Funktionen müssen auf `window` gesetzt werden.
* Die alten Variablen, wo überall davor `state` muss, ist auch sehr zach, weil es schon relativ viele sind und die in allen Modulen verteilt sind.
* Habe nur die Funktionen exportiert, die von anderen Modulen verwendet werden. Z. B.: `countEvidenceForPerson` in `people.js` kann privat bleiben, weil nur `renderPeople` es nutzt.
* `VM4826 index.html:1 Uncaught ReferenceError: navigateTo is not defined at HTMLButtonElement.onclick (VM4826 index.html:1:1)`

---

## 2. Fragen & Antworten

### Frage 1
> What is the difference between a classic `<script>` and a `<script type="module">`? Name at least two behavioral differences that are relevant to this app.

**Antwort:**  
Beim klassischen Script landet alles, was man schreibt, global und man kann es von überall initialisieren und benutzen. Bei `script type="module"` ist alles in der eigenen Datei privat, erst wenn man sie exportiert, können andere Dateien sie lesen. Die Module laufen auch asynchron ab.

---

### Frage 2
> Before your refactor, `allEvidence` was a global `var`, readable and writable from anywhere in `app.js`. After splitting into modules, what has to happen for a different module to read or change that value? What error do you get if you forget, and why is that error actually useful?

**Antwort:**  
For another Module to be able to read `allEvidence` it had to be exported in state and then imported in the other modules that needed it.

---

### Frage 3
> What's the difference between a named export and a default export? Point to one place in your refactor where you chose one over the other, and explain why.

**Antwort:**  
Named Exports haben einen bestimmten Namen und Module können mehrere haben. Default Exports ist der Main-Export von einem Modul und es kann nur eines haben. Das Modul, das importiert, kann dann den Namen des Default Exports selber aussuchen. Ich benutze keine Default Exports.

---

### Frage 4
> Why won't `type="module"` scripts run at all if you open `index.html` directly from disk (`file://...`) instead of through a local HTTP server? (You already need a server for `fetch()` — is this the same reason, a different one, or both?)

**Antwort:**  
Weil Skripte mit `type="module"` brauchen eine HTTP-Adresse, damit der Browser die importierten Dateien laden darf. Für `fetch()` ist es derselbe Grund, weil die Browser-CORS-Regeln verhindern den Zugriff von lokalen Dateien auf weitere Ressourcen.