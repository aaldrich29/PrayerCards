/**
 * Google Drive REST calls scoped to the hidden appDataFolder.
 * We keep a single JSON document (prayer-cards.json) there.
 */
import type { AppData } from '../types';
import { getAccessToken } from './auth';

const FILE_NAME = 'prayer-cards.json';
const FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files';

export interface DriveFile {
  id: string;
  modifiedTime: string;
}

async function authHeader(interactive: boolean): Promise<Record<string, string>> {
  const token = await getAccessToken(interactive);
  return { Authorization: `Bearer ${token}` };
}

/** Find the existing data file in appDataFolder, or null if none yet. */
export async function findFile(interactive = false): Promise<DriveFile | null> {
  const headers = await authHeader(interactive);
  const params = new URLSearchParams({
    spaces: 'appDataFolder',
    fields: 'files(id,modifiedTime)',
    q: `name='${FILE_NAME}'`,
    pageSize: '1',
  });
  const res = await fetch(`${FILES_URL}?${params}`, { headers });
  if (!res.ok) throw new Error(`Drive list failed (${res.status})`);
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files?.[0] ?? null;
}

export async function downloadFile(fileId: string): Promise<AppData> {
  const headers = await authHeader(false);
  const res = await fetch(`${FILES_URL}/${fileId}?alt=media`, { headers });
  if (!res.ok) throw new Error(`Drive download failed (${res.status})`);
  return (await res.json()) as AppData;
}

/** Create the file in appDataFolder (multipart so we can set name + parents). */
export async function createFile(data: AppData): Promise<DriveFile> {
  const headers = await authHeader(false);
  const boundary = 'pcboundary' + Math.random().toString(36).slice(2);
  const metadata = { name: FILE_NAME, parents: ['appDataFolder'] };
  const body =
    `--${boundary}\r\n` +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    `\r\n--${boundary}\r\n` +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(data) +
    `\r\n--${boundary}--`;

  const res = await fetch(`${UPLOAD_URL}?uploadType=multipart&fields=id,modifiedTime`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  });
  if (!res.ok) throw new Error(`Drive create failed (${res.status})`);
  return (await res.json()) as DriveFile;
}

/** Overwrite an existing file's contents (media upload). */
export async function updateFile(fileId: string, data: AppData): Promise<DriveFile> {
  const headers = await authHeader(false);
  const res = await fetch(`${UPLOAD_URL}/${fileId}?uploadType=media&fields=id,modifiedTime`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Drive update failed (${res.status})`);
  return (await res.json()) as DriveFile;
}
