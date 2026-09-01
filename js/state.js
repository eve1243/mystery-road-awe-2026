// ---------------------------------------------------------------------
// GLOBAL STATE
// ---------------------------------------------------------------------
export const state = {
  allEvidence: [],
  filteredEvidence: [],
  selectedEvidence: null,
  bookmarks: [],
  currentPage: "dashboard",

  allPeople: [],
  allLocations: [],
  allTimeline: [],
  caseData: {},

  currentPeopleTab: "people",
  loadingStepsRemaining: 2,

  evidenceViewLoading: true,

  viewRendered: {
    dashboard: false,
    evidence: false,
    people: false,
    timeline: false,
    workspace: false
  },

  notesStore: {},
  modalCloseListenerCount: 0,

  STORAGE_KEY_BOOKMARKS: "remotion_bookmarks",
  STORAGE_KEY_NOTES: "remotion_notes",
  STORAGE_KEY_HYPOTHESIS: "remotion_hypothesis"
};

export const allEvidence = state.allEvidence;
export const filteredEvidence = state.filteredEvidence;
export const selectedEvidence = state.selectedEvidence;
export const bookmarks = state.bookmarks;
export const currentPage = state.currentPage;

export const allPeople = state.allPeople;
export const allLocations = state.allLocations;
export const allTimeline = state.allTimeline;
export const caseData = state.caseData;

export const currentPeopleTab = state.currentPeopleTab;
export const loadingStepsRemaining = state.loadingStepsRemaining;

export const evidenceViewLoading = state.evidenceViewLoading;
export const viewRendered = state.viewRendered;
export const notesStore = state.notesStore;
export const modalCloseListenerCount = state.modalCloseListenerCount;

export const STORAGE_KEY_BOOKMARKS = state.STORAGE_KEY_BOOKMARKS;
export const STORAGE_KEY_NOTES = state.STORAGE_KEY_NOTES;
export const STORAGE_KEY_HYPOTHESIS = state.STORAGE_KEY_HYPOTHESIS;
