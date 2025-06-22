/**
 * Represents the authentication state of a user.
 */
export interface AuthState {
    authenticated: boolean;
    id: string;
}

/**
 * Represents the response received after a login attempt.
 */
export interface LoginResponse {
    message: string;
    status: number;
    user: {
        id: string;
        email: string;
        role: string;
    };
    csrfToken: string;
}

/**
 * Represents the response containing a CSRF token.
 */
export interface CsrfResponse {
    csrfToken: string;
}
