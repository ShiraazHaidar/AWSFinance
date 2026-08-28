import { getIdToken } from "./auth";
import { readApiError } from "./grantsApi";

export type EventRecord = {
  id?: string;
  name: string;
  date: string;
  location: string;
  budget: string;
  status: string;
  notes: string;
  createdAt?: string;
};

export type EventFormData = Omit<EventRecord, "id" | "createdAt">;

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") || "";

function requestError(response: Response) {
  return response.status === 401
    ? "Your session has expired. Please sign in again."
    : readApiError(response);
}

export async function fetchEvents() {
  const token = await getIdToken();
  const response = await fetch(`${apiBaseUrl}/events`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await requestError(response));
  }

  const data = (await response.json()) as EventRecord[];
  return Array.isArray(data) ? data : [];
}

export async function createEvent(event: EventFormData) {
  const token = await getIdToken();
  const response = await fetch(`${apiBaseUrl}/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    throw new Error(await requestError(response));
  }

  return (await response.json()) as EventRecord;
}