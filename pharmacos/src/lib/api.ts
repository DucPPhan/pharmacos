/**
 * A wrapper for the native `fetch` function to automatically handle
 * token attachment and authentication errors (401, 403).
 * @param url The API endpoint URL
 * @param options Fetch options (method, body, headers, etc.)
 * @returns A Promise that resolves with the JSON data from the API
 */
export async function apiFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");

    // Automatically attach the Authorization header if a token exists
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
    };

    const response = await fetch(url, { ...options, headers });

    // Check for authentication errors
    if (response.status === 401 || response.status === 403) {
        // The token is invalid or has expired
        // Clear user credentials
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("cart"); // Also clear the cart

        // Redirect to the login page and reload to reset the application state
        window.location.href = '/login';

        // Throw an error to prevent further processing
        throw new Error("Your session has expired. Please log in again.");
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An error occurred. Please try again.');
    }

    // Return the data if there are no errors
    // Some APIs (like DELETE) may not return a body, so we need to check
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json();
    }

    return; // Return undefined if there's no JSON body
}