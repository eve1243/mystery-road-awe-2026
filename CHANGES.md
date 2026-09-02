Einen Ordner für die module erstellt
Nach den Überschriften die Module erstellt

Einstiegspunkt der Anwendung auf main.js ändern.

Man kann importiere Variable nicht neu zuweisen, hatte fehler in api.js bei zb.: caseData = caseJson
genauso muss alles von state...... importiert werden.

Hatte einen Fehler beim start, weil ich die imports falsch gemacht habe. import * as state from ... geht nicht, weil state ein Modul name ist und schreibgeschützt ist, habe ein Object state erstellt und daraus kann man importieren.--> Objet Mutation

hab daweil das if (typeof window.renderDashboard === 'function') {
    window.renderDashboard();, weil ich noch nicht alle module sauber getrennt habe und so manchmal ann nicht weiß ob es global verfügbar ist

Hatte ann einen Fehler bei Modulieren, weil im index alte globale Funktionen erwartet werden, die ich dann noch ändern muss, damit alles geht. die inlick Funktion müssen auf window gesetzt werden

Die alten Variable wo überall davor state muss istauch sehr zach, weil es schon relativ viele sind und die in allen modulen verteilt sind.

Habe nur die Funktionen exportiert, die von anderen Modulen verwendet werden. zb.: countEvidenceForPerson in people.js kann privat bleiben, weil nur renderPeople es nutzt

VM4826 index.html:1 Uncaught ReferenceError: navigateTo is not defined
    at HTMLButtonElement.onclick (VM4826 index.html:1:1)

Fragen 1:
 What is the difference between a classic <script> and a <script type="module">? Name at least two behavioral differences that are relevant to this app.

 Beim klassischen script landet alles was man schreibt global und man es von überall inizialisieren und benutzen. Bei script type module ist alles in der eigenen Datei privat, erst wenn man sie exportiert könne andere datein sie lesen. Die Module laufen auch asynchron ab.

  Before your refactor, `allEvidence` was a global `var`, readable and writable from anywhere in
      `app.js`. After splitting into modules, what has to happen for a different module to read or
      change that value? What error do you get if you forget, and why is that error actually
      useful?
    For another Module to be able to read allEvidence it had to be exported in state and them imported in the othe modules that needed it. 

What's the difference between a named export and a default export? Point to one place in your
      refactor where you chose one over the other, and explain why.
Namend exports haben einen bestimmten namen und Module können mehrere haben. Default exports ist der main export von einem Modul und es kann nur eines haben. Das Modul, dass importiert kann dann den namen des default export selber aussuchen. Ich benutze keine default exports.

Why won't `type="module"` scripts run at all if you open `index.html` directly from disk
      (`file://...`) instead of through a local HTTP server? (You already need a server for
      `fetch()` — is this the same reason, a different one, or both?)

Weil Skripte mit type=module brauchen eine http-Addresse, damit der Browser die importierten Dateien laden darf. Für Fetch ist es der selbe Grund, weil die Browser Cors regeln, verhindern den Zugriff von lokalen Datein auf Weitere Ressourcen.

 