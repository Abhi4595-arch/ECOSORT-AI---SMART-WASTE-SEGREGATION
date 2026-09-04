import { API_URL } from "../config";

const TOKEN_KEY = "eco_sort_access_token";
const AUTH_EXPIRED_EVENT =
  "eco-sort-auth-expired";

function getFriendlyNetworkMessage(error) {
  if (error instanceof TypeError) {
    return "Unable to reach the Eco-Sort server. Check that the backend is running.";
  }

  return (
    error?.message ||
    "Something went wrong. Please try again."
  );
}

/* =========================================================
   AUTH TOKEN
========================================================= */

function getAccessToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/* =========================================================
   REQUEST HEADERS
========================================================= */

function buildHeaders(options = {}) {
  const headers = new Headers(
    options.headers || {}
  );

  const token = getAccessToken();

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  return headers;
}

/* =========================================================
   URL BUILDER
========================================================= */

function buildUrl(path) {
  if (!path) {
    return API_URL;
  }

  /*
   * Allows an absolute URL when an endpoint explicitly
   * provides one.
   */
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  return `${API_URL}${normalizedPath}`;
}

/* =========================================================
   AUTH EXPIRATION
========================================================= */

function notifyAuthExpired() {
  /*
   * Keep this event-based so AuthContext remains the
   * single source of truth for clearing the session.
   */
  window.dispatchEvent(
    new Event(AUTH_EXPIRED_EVENT)
  );
}

/* =========================================================
   FETCH
========================================================= */

export async function apiFetch(
  path,
  options = {}
) {
  const headers = buildHeaders(options);

  const requestOptions = {
    ...options,
    headers,
  };

  /*
   * Never manually set Content-Type for FormData.
   * The browser needs to generate the multipart boundary.
   */
  if (
    options.body instanceof FormData
  ) {
    headers.delete("Content-Type");
  }

  let response;

  try {
    response = await fetch(
      buildUrl(path),
      requestOptions
    );
  } catch (error) {
    throw new Error(
      getFriendlyNetworkMessage(error)
    );
  }

  /*
   * A 401 means the stored authentication session
   * is no longer valid.
   */
  if (response.status === 401) {
    notifyAuthExpired();
  }

  return response;
}

/* =========================================================
   JSON REQUEST
========================================================= */

export async function apiJson(
  path,
  options = {}
) {
  const response = await apiFetch(
    path,
    options
  );

  const data =
    await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      getApiErrorMessage(
        data,
        response.status
      )
    );
  }

  return data;
}

/* =========================================================
   ERROR NORMALIZATION
========================================================= */

function getApiErrorMessage(
  data,
  status
) {
  if (
    typeof data?.detail === "string" &&
    data.detail.trim()
  ) {
    return data.detail.trim();
  }

  if (Array.isArray(data?.detail)) {
    const messages = data.detail
      .map((item) => {
        if (
          typeof item === "string"
        ) {
          return item;
        }

        return item?.msg;
      })
      .filter(
        (message) =>
          typeof message === "string" &&
          message.trim()
      )
      .map((message) =>
        message.trim()
      );

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (
    typeof data?.message === "string" &&
    data.message.trim()
  ) {
    return data.message.trim();
  }

  if (
    typeof data?.error === "string" &&
    data.error.trim()
  ) {
    return data.error.trim();
  }

  return `Request failed (${status})`;
}

/* =========================================================
   OPTIONAL TEXT REQUEST
========================================================= */

export async function apiText(
  path,
  options = {}
) {
  const response = await apiFetch(
    path,
    options
  );

  const text =
    await response.text().catch(() => "");

  if (!response.ok) {
    let parsedData = {};

    try {
      parsedData = text
        ? JSON.parse(text)
        : {};
    } catch {
      parsedData = {};
    }

    throw new Error(
      getApiErrorMessage(
        parsedData,
        response.status
      )
    );
  }

  return text;
}

/* =========================================================
   EXPORTS
========================================================= */

export {
  API_URL,
  TOKEN_KEY,
  AUTH_EXPIRED_EVENT,
  getApiErrorMessage,
};