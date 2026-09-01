//Module importieren
import * as state from './js/state.js';
import { loadAllData } from './js/api.js';



Object.assign(window, state);

// 3. Anwendung beim Laden der Seite starten
document.addEventListener("DOMContentLoaded", function () {
  console.log("App wird über ES-Module gestartet...");
  loadAllData();
});