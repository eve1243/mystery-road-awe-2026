Einen Ordner für die module erstellt
Nach den Überschriften die Module erstellt

Einstiegspunkt der Anwendung auf main.js ändern.

Man kann importiere Variable nicht neu zuweisen, hatte fehler in api.js bei zb.: caseData = caseJson
genauso muss alles von state...... importiert werden.

Hatte einen Fehler beim start, weil ich die imports falsch gemacht habe. import * as state from ... geht nicht, weil state ein Modul name ist und schreibgeschützt ist, habe ein Object state erstellt und daraus kann man importieren.--> Objet Mutation

hab daweil das if (typeof window.renderDashboard === 'function') {
    window.renderDashboard();, weil ich noch nicht alle module sauber getrennt habe und so manchmal ann nicht weiß ob es global verfügbar ist
