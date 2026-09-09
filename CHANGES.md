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

---

## Demo 2

### Mutation eines Evidence-Objekts ohne Aktualisierung des Dashboards

#### Reproduktion

1. Die Anwendung über einen lokalen HTTP-Server starten.
2. Eine Evidence öffnen und im Detailbereich den Review status auf `Reviewed`
	ändern.
3. Zum Dashboard wechseln.
4. Vor dem Fix blieb der Wert bei `Reviewed` und der Review-Fortschritt zeigte
	weiterhin den alten Stand.

#### Ursache und Fix

Der Status wurde direkt am geladenen Evidence-Objekt verändert:
`ev.status = e.target.value`. Das Objekt im State war dadurch bereits geändert,
aber das Dashboard wurde danach nicht neu gerendert. Die Oberfläche zeigte daher
eine veraltete Darstellung des mutierten State.

Nach der Mutation wird jetzt `renderDashboard()` aufgerufen. Dadurch werden die
Anzahl der geprüften Evidence und der Review-Fortschritt sofort neu berechnet.

#### Antworten auf die Fragen

Explain — in your own words — the difference between a *reference* and a *copy* in
      JavaScript, and how that distinction explains what you observed.
In JavaScript kopiert man normalerweise ein Objekt nicht, wenn man es aus einer anderen Variable zuweist. Beide Variablen zeigen da auf das gleiche Object. Heißt es gibt keine "echten" kopien.



- [ ] Walk through the exact user actions and system state that trigger the bug. Could you have
      found it by reading the code top-to-bottom without running it? Why or why not?
Webseite öffen, dann auf evidence gehen, dort eine Evidence öffnen, im Dropdown den review status auf reviewed ändern. Dann zum Dashboard wechseln, bevor ist der review Fortschritt gleich, nachdem es nach dem verändern, von der Evidence, das Dashboard immer new rendert, wird der vorschritt richtig angezeigt. Ne ich hätts nicht gemerkt, ohne es auf der webseite zu sehen.

## Demo 3

### Asynchroner Fehler: Evidence bleibt im Ladezustand

#### Reproduktion

1. Die Anwendung über einen lokalen HTTP-Server starten.
2. Die Seite laden und zur Evidence-Ansicht wechseln.
3. Obwohl `data/evidence.json` erfolgreich geladen wird, bleibt die Evidence-Liste leer und der Ladeindikator sichtbar.

#### Ursache und Fix

`state.evidenceViewLoading` blieb nach dem Laden von `evidence.json` auf `true`. Deshalb beendete sich `renderEvidenceList()` weiterhin im Lade-Block. Zusätzlich wartete `loadAllData()` nicht auf den Evidence-Promise.

`loadEvidenceData()` gibt jetzt den Fetch-Promise zurück, setzt den Ladezustand nach Erfolg oder Fehler auf `false`, und `loadAllData()` wartet mit `Promise.all()` auf Evidence- und Timeline-Daten.

#### Antwort auf die Frage

Der Fehler passierte nach dem Start des asynchronen `fetch()`-Vorgangs: Die Daten wurden erfolgreich geladen, aber der Status blieb fälschlicherweise auf „loading“. Dadurch wurde der fertige Zustand nicht angezeigt.

---

## Demo 7

### DevTools-Tour

#### Console

Beim normalen Start der Anwendung wurden keine Fehler und keine Warnungen
angezeigt. Es war eine Info-Meldung vorhanden:

```text
First note preview:
```

Mit dem Log-Level-Filter können Errors und Warnings einzeln angezeigt werden.
Das Textfilterfeld kann verwendet werden, um nach einer bestimmten Meldung zu
suchen. Mit `Preserve log` bleiben Meldungen auch nach einem Reload oder beim
Navigieren erhalten.

#### Network

Nach dem Reload mit geöffnetem Network-Tab wurden Requests für die JSON-Dateien
angezeigt, unter anderem `case.json`, `people.json`, `locations.json`,
`evidence.json` und `timeline.json`. Die Requests hatten im normalen Lauf den
Status `200` und den Typ `fetch`. In der Response konnte der Inhalt der jeweiligen
JSON-Datei und unter Timing die Dauer des Requests überprüft werden.

Bei aktivierter Drosselung `Slow 3G` dauerte das Laden deutlich länger. Die
Anwendung zeigte die Daten nicht gleichzeitig an, weil die Requests und die
anschließenden Render-Aufrufe asynchron abgeschlossen werden. Danach wurde die
Drosselung wieder auf `No throttling` zurückgestellt.

#### Application / Local Storage

Ursprünglich waren in meinem Local Storage zwei Schlüssel vorhanden:
`remotion_notes` und `remotion_hypothesis`. Ich habe den Schlüssel
`remotion_notes` in `remotion` umbenannt und danach die Seite neu geladen. Es
passierte nichts, weil die Anwendung weiterhin ausschließlich nach dem exakten
Namen `remotion_notes` sucht. Der umbenannte Schlüssel `remotion` wurde deshalb
nicht erkannt.

Wenn ein Wert mit ungültigem JSON ersetzt wird, kann `JSON.parse()` beim Laden
fehlschlagen. Bei Bookmarks wird dieser Fehler abgefangen und mit einer leeren
Liste weitergemacht. Bei Notizen oder der Hypothese wird der Fehler derzeit nicht
an derselben Stelle abgefangen, deshalb kann der Ladevorgang dort einen Fehler in
der Console erzeugen.

#### Elements

Eine Evidence-Karte enthält unter anderem die Klasse `evidence-card`, die
Evidence-ID als `data-id`, einen Titel, Status- und Relevanz-Badges sowie die
Tags. Diese HTML-Struktur wird in `renderEvidenceCardHTML()` in `evidence.js`
erzeugt und anschließend von `renderEvidenceList()` in den Container
`evidenceList` eingesetzt.

#### Antworten auf die Fragen

**Was ist der praktische Unterschied zwischen `console.log`, `console.warn` und
`console.error`?**

`console.log` gibt normale Informationen aus. `console.warn` weist auf eine
mögliche problematische Situation hin. `console.error` kennzeichnet einen Fehler
und enthält häufig zusätzliche Informationen wie einen Stack Trace. Die
Meldungen können in den DevTools nach ihrem Level gefiltert werden.

**Was bedeuten Status, Type und Time bei einem Fetch-Request?**

`Status` zeigt das HTTP-Ergebnis, zum Beispiel `200` für eine erfolgreiche
Antwort. `Type` beschreibt die Art der Ressource beziehungsweise des Requests,
hier `fetch`. `Time` zeigt, wie lange der Request gedauert hat. Bei einem `404`
wird `fetch()` nicht automatisch abgelehnt, weil der Code `res.ok` derzeit nicht
prüft. Wenn die 404-Antwort kein gültiges JSON enthält, schlägt `res.json()` fehl
und der `catch`-Block gibt eine Fehlermeldung aus. Eine 404-Antwort mit gültigem
JSON würde der aktuelle Code jedoch nicht als Fehler erkennen.

**Welche Local-Storage-Keys gibt es und was passiert bei ungültigem JSON?**

Der Code verwendet `remotion_bookmarks`, `remotion_notes` und
`remotion_hypothesis`. In meiner Local-Storage-Ansicht waren aber nur
`remotion` und `remotion_hypothesis` vorhanden. `remotion` wird nicht gelesen,
weil der Code exakt `remotion_notes` erwartet. Beim erneuten Laden werden die
Werte mit `JSON.parse()` gelesen. Ungültiges JSON erzeugt einen Parse-Fehler. Der
Bookmark-Ladevorgang fängt diesen Fehler ab und verwendet eine leere
Bookmark-Liste; bei Notizen und der Hypothese wird der Fehler derzeit nicht
abgefangen und kann in der Console erscheinen.

**Was wurde bei Slow 3G beobachtet und warum ist die Reihenfolge wichtig?**

Die Requests und das Befüllen der Ansichten dauern länger und einzelne Bereiche
können währenddessen noch leer sein. `loadCorePeopleAndLocations()` lädt zuerst
Fall-, Personen- und Standortdaten. Danach werden Evidence und Timeline geladen.
Die Reihenfolge ist wichtig, weil Renderer und Dropdowns auf den geladenen State
zugreifen. Würde eine Ansicht zu früh rendern, wären dort vorübergehend leere
Listen oder fehlende Auswahloptionen zu sehen.