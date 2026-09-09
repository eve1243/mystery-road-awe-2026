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
Bei einem normalen Script sind viele Variablen global. Das ist praktisch, aber sie können sich auch leichter überschreiben. Bei einem Modul bleibt der Code zuerst in seiner Datei. Andere Dateien brauchen dafür export und import. Module laufen außerdem automatisch im strict mode.

---

### Frage 2
> Before your refactor, `allEvidence` was a global `var`, readable and writable from anywhere in `app.js`. After splitting into modules, what has to happen for a different module to read or change that value? What error do you get if you forget, and why is that error actually useful?

**Antwort:**  
Damit ein anderes Modul allEvidence verwenden kann, muss ich die Variable exportieren und dort importieren. Wenn der Import fehlt, kommt ein ReferenceError. Das ist hilfreich. So sehe ich schnell, dass etwas fehlt.

---

### Frage 3
> What's the difference between a named export and a default export? Point to one place in your refactor where you chose one over the other, and explain why.

**Antwort:**  
Ein Named Export hat einen festen Namen. Ein Modul kann mehrere davon haben. Einen Default Export gibt es pro Modul nur einmal. Beim Import kann man ihn umbenennen. Ich habe Named Exports verwendet. Zum Beispiel bei loadAllData in api.js. So bleiben die Namen eindeutig.

---

### Frage 4
> Why won't `type="module"` scripts run at all if you open `index.html` directly from disk (`file://...`) instead of through a local HTTP server? (You already need a server for `fetch()` — is this the same reason, a different one, or both?)

**Antwort:**  
Die App braucht einen Server. Der Browser lädt Module von file nicht normal. Auch fetch auf die JSON-Dateien funktioniert dann wegen den Sicherheitsregeln nicht. Deshalb starte ich die App über einen HTTP-Server.

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

**Question 1: What is the difference between a reference and a copy in
JavaScript? How does this explain the bug?**
Bei Objekten wird bei einer Zuweisung nicht automatisch eine Kopie gemacht. Beide Variablen zeigen auf dasselbe Objekt. Wenn ich ev.status ändere, ändere ich also auch den State. Für eine echte Kopie müsste ich das Objekt extra kopieren. Das Hauptproblem war aber auch, dass das Dashboard danach nicht neu gerendert wurde.



**Question 2: Which steps trigger the bug? Could I have found it just by
reading the code?**
Ich öffne die Seite und gehe zu Evidence. Dann wähle ich eine Evidence aus. Im Dropdown stelle ich den Status auf Reviewed. Danach gehe ich zum Dashboard. Vor dem Fix war der Status im State schon geändert. Das Dashboard zeigte aber noch den alten Stand. Beim Lesen des Codes wäre das nicht sofort aufgefallen. Ich habe es erst beim Ausprobieren gesehen.

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

**Question: What exactly was wrong with the asynchronous bug?**

Der fetch war erfolgreich. Die Daten waren also da. Der Ladezustand blieb aber auf true. Deshalb dachte die App noch, dass sie lädt. Die Liste wurde nicht angezeigt. Das habe ich im Network-Tab und beim Ladezustand gesehen.

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

**Question 1: What is the practical difference between console.log, console.warn
and console.error?**

console.log ist für normale Infos. console.warn zeigt eine mögliche Warnung.
console.error zeigt einen Fehler. Bei error sieht man oft auch den Stack Trace.
In den DevTools kann ich nach diesen Arten filtern.

**Question 2: What do Status, Type and Time mean for a fetch request?**

Status ist der HTTP-Status. 200 bedeutet zum Beispiel Erfolg. Type zeigt hier
fetch. Time zeigt, wie lange der Request gebraucht hat. Bei 404 wird fetch nicht
automatisch abgelehnt, weil res.ok nicht geprüft wird. Bei falschem JSON gibt es
einen Fehler. Ein 404 mit gültigem JSON würde aber nicht erkannt werden.

**Question 3: Which local storage keys does the app use, and what happens with
invalid JSON?**

Die Keys sind remotion_bookmarks, remotion_notes und remotion_hypothesis. Bei
mir waren aber remotion und remotion_hypothesis vorhanden. remotion wird nicht
gefunden, weil genau nach remotion_notes gesucht wird. Beim Laden wird JSON.parse
verwendet. Bei falschem JSON kommt ein Fehler. Bei Bookmarks wird er abgefangen.
Bei Notizen und der Hypothese kann er in der Console erscheinen.

**Question 4: What happened with Slow 3G, and why is the loading order important?**

Mit Slow 3G dauern die Requests länger. Manche Bereiche bleiben kurz leer. Zuerst
werden Fall-, Personen- und Standortdaten geladen. Danach kommen Evidence und
Timeline. Die Reihenfolge ist wichtig, weil die Ansichten diese Daten brauchen.
Sonst sieht man leere Listen oder fehlende Optionen.

---

## Demo 8

### `var`, `let` und `const`

Die aktiven `var`-Deklarationen in `main.js` und den Modulen unter `js/` wurden
durch `let` oder `const` ersetzt. `const` wird für Bindungen verwendet, die nicht
neu zugewiesen werden. `let` bleibt bei Schleifenzählern und Werten, die im
Ablauf neu zugewiesen werden. Beide sind nur im jeweiligen Block sichtbar und
können dadurch nicht versehentlich außerhalb dieses Blocks verwendet werden.
Die enthaltenen Objekte und Arrays dürfen auch bei `const` weiterhin mutiert
werden; nur die Variable selbst darf nicht auf ein anderes Objekt zeigen.

Vorher konnte `var` wegen seiner Funktions- statt Block-Sichtbarkeit leichter zu
Namenskonflikten führen. In einer Schleife konnte eine Variable dadurch auch in
einem größeren Gültigkeitsbereich sichtbar sein als beabsichtigt. `let` ist
block-sichtbar und verhindert diese Art von versehentlicher Wiederverwendung.
Ein vergessenes Deklarationswort erzeugt in einem ES-Modul wegen des strikten
Modus außerdem einen `ReferenceError`, statt eine globale Variable anzulegen.

### Weitere Code-Smells

1. Viele Ansichten bauen große HTML-Strings direkt mit String-Verkettung auf.
	Das erschwert Änderungen und kann bei nicht bereinigten Benutzereingaben zu
	unsicherem HTML führen.
2. Die Datenladung war zunächst über mehrere verschachtelte `.then()`-Aufrufe
	verteilt und schwer zu verfolgen. Das wurde als eigener asynchroner Fehler in
	Demo 3 untersucht.

### Antworten auf die Fragen

**Question 1: What is the difference between var, let and const?**

var gilt für die ganze Funktion und kann noch einmal deklariert werden. let und
const gelten nur im Block. let kann neu gesetzt werden. const nicht. Für eine
DOM-Referenz nehme ich const. Für einen Schleifenzähler passt let.

**Question 2: What is an accidental global? What happens in an ES module?**

Ein accidental global entsteht, wenn man eine Variable ohne var, let oder const
schreibt. In einem normalen Script kann sie dann global werden. Bei einem Modul
kommt im strict mode ein ReferenceError. So fällt der Fehler sofort auf.

**Question 3: Name one code smell that can be a problem even when the code
works.**

Ein Beispiel sind die var-Variablen in den Schleifen. Die App funktioniert damit.
Die Variablen sind aber länger sichtbar als nötig. Mit let bleiben sie im Block.
Das ist übersichtlicher.

---

## Demo 9

### Refaktorierung von Promises zu `async`/`await`

Die ursprüngliche Datenladung war mehrfach verschachtelt: Zuerst wurde
`case.json` geladen, danach `people.json` und erst danach `locations.json`. Die
nächste Anfrage startete jeweils erst, wenn die vorherige Anfrage und ihr
`response.json()`-Promise abgeschlossen waren.

`loadCorePeopleAndLocations()` verwendet jetzt `async`/`await`. Die drei
Requests bleiben absichtlich sequentiell. `loadTimelineData()` wurde ebenfalls
umgebaut und verwendet weiterhin `try`/`catch`/`finally`. In `loadAllData()`
werden Evidence und Timeline nach dem Core-Ladevorgang weiterhin mit
`Promise.all()` parallel gestartet.

### Antworten auf die Fragen

**Question 1: What does await do? What happens to the rest of the program?**

Mit await wartet die async-Funktion, bis das Promise fertig ist. Der restliche
Code kann inzwischen weiterlaufen. Schneller wird es dadurch nicht. Der Code ist
aber leichter zu lesen.

**Question 2: What does an async function always return?**

Eine async-Funktion gibt immer ein Promise zurück. Deshalb kann ich danach auch
then verwenden. Das funktioniert bei loadCorePeopleAndLocations, obwohl darin
await benutzt wird.

**Question 3: What is the equivalent of catch when using async/await?**

Das Gegenstück zu catch ist try/catch. In loadTimelineData wird der Fehler im
catch geloggt. Mit finally wird das Laden beendet. Das passiert auch bei einem
Fehler.

**Question 4: What happens if I remove an await?**

Wenn ich ein await entferne, läuft die Funktion zu früh weiter. Die Variable
enthält dann noch ein Promise und nicht die Daten. Dadurch können leere Ansichten
entstehen. Das ist ein typischer Async-Fehler.

**Question 5: Does async/await make the code faster?**

Die Geschwindigkeit und die Reihenfolge ändern sich nicht. case.json, people.json
und locations.json werden weiter nacheinander geladen. Der Code ist mit
async/await nur übersichtlicher.

---

## Demo 10

Zwei Utility-Funktionen in `js/utils.js` wurden zu Arrow Functions umgebaut:
`findEvidenceById` und `findPersonById`. Beide verwenden kein eigenes `this`,
keine `arguments`-Variable und werden nicht als Konstruktor verwendet. Deshalb
ändert sich ihr Laufzeitverhalten nicht.

Zusätzlich wurde der `input`-Callback des Confidence-Sliders in `main.js` zu
einer Arrow Function umgebaut. Statt des dynamischen `this` verwendet er
`event.currentTarget`, wodurch weiterhin das auslösende Eingabefeld gelesen
wird.

Die Navigations-Callbacks mit `function ()` wurden bewusst nicht alle geändert,
weil sie `this` als das geklickte Element verwenden. Eine Arrow Function würde
dort kein eigenes dynamisches `this` erhalten. Außerdem bleiben
Funktionsdeklarationen wie `setupEventListeners` und `initApp` reguläre
Funktionen, weil ihre Hoisting-Eigenschaft im bestehenden Initialisierungsablauf
unverändert bleiben soll.

### Antworten auf die Fragen

**Question 1: How do arrow functions handle this differently from regular
functions?**

Arrow Functions haben kein eigenes this. Sie nehmen das this vom äußeren Code.
Bei normalen Funktionen hängt this vom Aufruf ab. Als Objektmethode kann eine
Arrow Function deshalb problematisch sein. Bei Callbacks ist es oft praktisch,
weil der äußere Kontext erhalten bleibt.

**Question 2: Did the limitations with constructors or arguments affect the
conversion?**

Nein. Die Funktionen werden nicht mit new aufgerufen. arguments wird auch nicht
verwendet. Die Utilities bekommen ihre id als Parameter. Das gilt auch für den
Slider-Callback. Deshalb gab es hier kein Problem.

**Question 3: Did hoisting matter during the refactor?**

Nein. Eine Arrow Function mit const kann erst nach ihrer Initialisierung benutzt
werden. Die Utilities werden aber erst benutzt, nachdem das Modul geladen wurde.
Darum hat das hier keinen Unterschied gemacht. setupEventListeners und initApp
blieben normale Funktionen.

**Question 4: Show a concrete before-and-after example. Is there any runtime
difference?**

Vorher in `js/utils.js`:

```js
export function findPersonById(id) {
	for (let i = 0; i < state.allPeople.length; i++) {
		if (state.allPeople[i].id === id) return state.allPeople[i];
	}
	return null;
}
```

Nachher:

```js
export const findPersonById = (id) => {
	for (let i = 0; i < state.allPeople.length; i++) {
		if (state.allPeople[i].id === id) return state.allPeople[i];
	}
	return null;
};
```

Bei dieser Funktion gibt es im normalen Aufruf keinen Unterschied. Beide suchen
dieselbe Person. Es ist hauptsächlich eine Stiländerung. this und Hoisting sind
hier nicht wichtig.

**Question 5: What rule would you suggest for choosing between function types?**

Ich würde Arrow Functions für Callbacks und einfache Funktionen verwenden. Für
Objektmethoden würde ich normale Funktionen nehmen, wenn this gebraucht wird.
Normale Funktionsdeklarationen passen auch für wichtige, benannte Funktionen.
So richtet sich die Entscheidung nach der Funktion und nicht nur nach dem Stil.