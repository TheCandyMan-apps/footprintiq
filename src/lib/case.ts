import { Finding } from "./ufm";

/**
 * Case Management — IndexedDB storage for analyst workspace
 * Stores pinned findings, notes, tags, and case metadata
 */

export interface CaseNote {
  id: string;
  findingId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface Case {
  id: string;
  name: string;
  description: string;
  pinnedFindingIds: string[];
  notes: CaseNote[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  findings: Finding[];
}

const DB_NAME = "footprintiq_cases";
const DB_VERSION = 1;
const STORE_NAME = "cases";

let dbInstance: IDBDatabase | null = null;

/**
 * Initialize IndexedDB
 */
async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

/**
 * Save a case to IndexedDB
 */
export async function saveCase(caseData: Case): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(caseData);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Load a case from IndexedDB
 */
export async function loadCase(caseId: string): Promise<Case | null> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(caseId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || null);
  });
}

/**
 * List all cases
 */
export async function listCases(): Promise<Case[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result || []);
  });
}

/**
 * Delete a case
 */
export async function deleteCase(caseId: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(caseId);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Create a new case
 */
export function createCase(name: string, description: string = ""): Case {
  return {
    id: `case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    pinnedFindingIds: [],
    notes: [],
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    findings: [],
  };
}

/**
 * Add a note to a case
 */
export function addNoteToCase(
  caseData: Case,
  findingId: string,
  content: string
): Case {
  const note: CaseNote = {
    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    findingId,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    ...caseData,
    notes: [...caseData.notes, note],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Pin a finding to a case
 */
export function pinFindingToCase(caseData: Case, finding: Finding): Case {
  if (caseData.pinnedFindingIds.includes(finding.id)) {
    return caseData;
  }

  return {
    ...caseData,
    pinnedFindingIds: [...caseData.pinnedFindingIds, finding.id],
    findings: [...caseData.findings, finding],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Unpin a finding from a case
 */
export function unpinFindingFromCase(caseData: Case, findingId: string): Case {
  return {
    ...caseData,
    pinnedFindingIds: caseData.pinnedFindingIds.filter((id) => id !== findingId),
    findings: caseData.findings.filter((f) => f.id !== findingId),
    notes: caseData.notes.filter((n) => n.findingId !== findingId),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Export case as JSON
 */
export function exportCaseAsJSON(caseData: Case): string {
  return JSON.stringify(caseData, null, 2);
}
