//Module importieren
import * as state from './js/state.js';
import { loadAllData } from './js/api.js';
import * as utils from './js/utils.js';
import { navigateTo, handleHashChange } from './js/router.js';


Object.assign(window, utils);
window.navigateTo = navigateTo;
window.handleHashChange = handleHashChange;

window.addEventListener("hashchange", handleHashChange);

// 3. Anwendung beim Laden der Seite starten
document.addEventListener("DOMContentLoaded", function () {
  console.log("App wird über ES-Module gestartet...");
  loadAllData();
});