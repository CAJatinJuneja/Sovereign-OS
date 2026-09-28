// Tiny synchronous singleton holding the current signed-in user's id.
// Set once by AuthContext on login/logout; read by cloudStorage and
// imageStore so they don't need the id threaded through every call site.
let currentUserId: string | null = null;

export function setCurrentUserId(id: string | null): void {
  currentUserId = id;
}

export function getCurrentUserId(): string | null {
  return currentUserId;
}
