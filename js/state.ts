export interface Evidence {
  id: EvidenceId;
  type: string;
  title: string;
  timestamp: string;
  summary: string;
  content: string;
  personIds: PersonId[];
  locationIds: LocationId[];
  tags: string[];
  status: string;
  relevance: string;
  bookmarked?: boolean;
}

export interface Person {
  id: PersonId;
  name: string;
  role: string;
  speciality: string;
  responsibilities: string[];
  statement: string;
  background: string;
  avatar: string;
}

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  contains: string[];
}

export interface TimelineEvent {
  id: TimelineEventId;
  time: string;
  title: string;
  description: string;
  type: string;
  certainty: string;
  personIds: PersonId[];
  locationIds: LocationId[];
  evidenceIds: EvidenceId[];
}

export type EvidenceId = `E${string}`;
export type PersonId =
  | "signal-scholar"
  | "kernel-colt"
  | "nova-byte"
  | "patch-vector"
  | "refactor-rex"
  | "root-harbor";
export type LocationId = `L${string}`;
export type TimelineEventId = `T${string}`;

export interface CaseData {
  caseId: string;
  title: string;
  subtitle: string;
  status: string;
  opened: string;
  summary: string;
  location: string;
  leadInvestigator: string;
  notes: string;
}

export interface AppState {
  allEvidence: Evidence[];
  filteredEvidence: Evidence[];
  selectedEvidence: Evidence | null;
  bookmarks: string[];
  currentPage: string;
  allPeople: Person[];
  allLocations: Location[];
  allTimeline: TimelineEvent[];
  caseData: CaseData;
  currentPeopleTab: string;
  loadingStepsRemaining: number;
  evidenceViewLoading: boolean;
  viewRendered: Record<string, boolean>;
  notesStore: Record<string, string>;
  modalCloseListenerCount: number;
  STORAGE_KEY_BOOKMARKS: string;
  STORAGE_KEY_NOTES: string;
  STORAGE_KEY_HYPOTHESIS: string;
}

export const state: AppState = {
  allEvidence: [],
  filteredEvidence: [],
  selectedEvidence: null,
  bookmarks: [],
  currentPage: "dashboard",
  allPeople: [],
  allLocations: [],
  allTimeline: [],
  caseData: {
    caseId: "",
    title: "",
    subtitle: "",
    status: "",
    opened: "",
    summary: "",
    location: "",
    leadInvestigator: "",
    notes: "",
  },
  currentPeopleTab: "people",
  loadingStepsRemaining: 2,
  evidenceViewLoading: true,
  viewRendered: {
    dashboard: false,
    evidence: false,
    people: false,
    timeline: false,
    workspace: false,
  },
  notesStore: {},
  modalCloseListenerCount: 0,
  STORAGE_KEY_BOOKMARKS: "remotion_bookmarks",
  STORAGE_KEY_NOTES: "remotion_notes",
  STORAGE_KEY_HYPOTHESIS: "remotion_hypothesis",
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
