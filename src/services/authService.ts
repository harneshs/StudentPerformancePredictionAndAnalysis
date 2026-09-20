import { StaffUser } from '../types';
import { storageService } from './storageService';

/**
 * PROTOTYPE AUTHENTICATION SERVICE
 *
 * NOTE: This is client-side prototype authentication designed for local demonstration
 * and college project workflows. It stores session state in browser LocalStorage.
 * This is NOT production-grade cryptographic authentication.
 */

const DEMO_CREDENTIALS = {
  username: 'admin',
  password: 'admin123',
  name: 'Prof. S. R. Ramanathan',
  role: 'Senior Academic Coordinator & Staff',
};

export const authService = {
  /**
   * Check if current staff user is logged in
   */
  getCurrentUser(): StaffUser | null {
    const session = storageService.getAuthSession();
    if (!session) return null;
    const profile = storageService.getStaffProfile();
    return {
      ...session,
      name: profile.name || session.name,
      role: profile.role || session.role,
      department: profile.department || session.department,
      institution: profile.institution || session.institution,
    };
  },

  /**
   * Attempt staff login with prototype credentials
   */
  login(username: string, password: string): { success: boolean; user?: StaffUser; error?: string } {
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, error: 'Username and password are required.' };
    }

    // Check against prototype credentials
    if (trimmedUser === DEMO_CREDENTIALS.username && trimmedPass === DEMO_CREDENTIALS.password) {
      const profile = storageService.getStaffProfile();
      const user: StaffUser = {
        username: DEMO_CREDENTIALS.username,
        name: profile.name || DEMO_CREDENTIALS.name,
        role: profile.role || DEMO_CREDENTIALS.role,
        department: profile.department,
        institution: profile.institution,
        isLoggedIn: true,
      };
      storageService.setAuthSession(user);
      return { success: true, user };
    }

    return {
      success: false,
      error: 'Invalid credentials. Default prototype login: admin / admin123',
    };
  },

  /**
   * Update active staff profile
   */
  updateProfile(profile: Partial<StaffUser>): StaffUser | null {
    storageService.saveStaffProfile(profile);
    return this.getCurrentUser();
  },

  /**
   * Staff logout
   */
  logout(): void {
    storageService.setAuthSession(null);
  },
};
