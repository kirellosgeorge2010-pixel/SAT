import { useState, useCallback } from 'react';
import { entriesToSheetRows } from '../utils/csvExport';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient = null;
let gapiLoaded = false;
let gisLoaded = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function ensureGapi() {
  if (!gapiLoaded) {
    await loadScript('https://apis.google.com/js/api.js');
    await new Promise(resolve => window.gapi.load('client', resolve));
    await window.gapi.client.init({});
    gapiLoaded = true;
  }
}

async function ensureGis() {
  if (!gisLoaded) {
    await loadScript('https://accounts.google.com/gsi/client');
    gisLoaded = true;
  }
}

/**
 * Hook: useGoogleSheets
 * Handles Google OAuth 2.0 token flow and Sheets API writes.
 */
export function useGoogleSheets() {
  const [isAuthed, setIsAuthed] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [pushError, setPushError] = useState(null);
  const [pushSuccess, setPushSuccess] = useState(false);

  const isConfigured = !!(CLIENT_ID && CLIENT_ID !== 'your_google_client_id_here.apps.googleusercontent.com');

  /**
   * Authenticate with Google and get an access token.
   * Returns the access token string.
   */
  const authenticate = useCallback(async () => {
    if (!isConfigured) throw new Error('Google Client ID not configured in .env');

    await ensureGapi();
    await ensureGis();

    return new Promise((resolve, reject) => {
      if (!tokenClient) {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error));
              return;
            }
            window.gapi.client.setToken(response);
            setIsAuthed(true);
            resolve(response.access_token);
          },
        });
      }
      tokenClient.requestAccessToken({ prompt: '' });
    });
  }, [isConfigured]);

  /**
   * Push entries to a Google Sheet.
   * @param {string} spreadsheetId - The Google Spreadsheet ID from the URL
   * @param {string} sheetName - Tab name (e.g. "Error Log")
   * @param {Array<Object>} entries - The error log entries
   */
  const pushToSheet = useCallback(async (spreadsheetId, sheetName, entries) => {
    setPushError(null);
    setPushSuccess(false);
    setIsPushing(true);

    try {
      // Ensure authenticated
      let token = window.gapi?.client?.getToken()?.access_token;
      if (!token) {
        token = await authenticate();
      }

      const rows = entriesToSheetRows(entries);
      const range = `${sheetName}!A1`;

      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range,
            majorDimension: 'ROWS',
            values: rows,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err?.error?.message || 'Sheets API error');
      }

      setPushSuccess(true);
    } catch (err) {
      setPushError(err.message);
    } finally {
      setIsPushing(false);
    }
  }, [authenticate]);

  const signOut = useCallback(() => {
    if (window.gapi?.client?.getToken()) {
      window.google?.accounts.oauth2.revoke(window.gapi.client.getToken().access_token);
      window.gapi.client.setToken(null);
    }
    setIsAuthed(false);
    setPushSuccess(false);
  }, []);

  return {
    isConfigured,
    isAuthed,
    isPushing,
    pushError,
    pushSuccess,
    authenticate,
    pushToSheet,
    signOut,
    setPushSuccess,
    setPushError,
  };
}
