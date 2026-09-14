import { Evidence, Location, Person, state } from "./state.js";

export const findEvidenceById = (id: string): Evidence | null => {
  for (const evidence of state.allEvidence) {
    if (evidence.id === id) return evidence;
  }
  return null;
};

export const findPersonById = (id: string): Person | null => {
  for (const person of state.allPeople) {
    if (person.id === id) return person;
  }
  return null;
};

export function findLocationById(id: string): Location | null {
  for (const location of state.allLocations) {
    if (location.id === id) return location;
  }
  return null;
}

export function evidenceMentionsPerson(
  evidence: Evidence,
  person: Person
): boolean {
  return (
    evidence.personIds.includes(person.id) ||
    evidence.personIds.includes(person.name)
  );
}

export function formatDate(timestamp: string): string {
  if (!timestamp) return "Unknown date";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return `${date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })} ${date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function getStatusBadgeClass(status: string): string {
  const normalizedStatus = status.toLowerCase();
  if (normalizedStatus === "reviewed") return "badge-reviewed";
  if (normalizedStatus === "flagged") return "badge-flagged";
  return "badge-unreviewed";
}

export function getRelevanceBadgeClass(relevance: string): string {
  return relevance.toLowerCase() === "relevant"
    ? "badge-relevant"
    : "badge-unreviewed";
}
