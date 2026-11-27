import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  loginRequest,
  logoutRequest,
  meRequest,
  registerRequest,
  switchTenantRequest,
} from './api';
import { tokenStorage } from '@/shared/helpers/storage';
import type { AuthSession, AuthUser, Membership, MembershipRole } from '@/shared/types/auth';

type AuthState = {
  user: AuthUser | null;
  memberships: Membership[];
  activeTenantId: string | null;
  membershipRole: MembershipRole | null;
  bootstrapping: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  login: (email: string, password: string, tenantId?: string) => Promise<AuthSession>;
  register: (input: {
    email: string;
    password: string;
    fullName: string;
    tenantName: string;
  }) => Promise<AuthSession>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  refreshMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function applySession(
  session: Pick<
    AuthSession,
    'user' | 'memberships' | 'activeTenantId' | 'membershipRole' | 'accessToken' | 'refreshToken'
  >,
  set: (s: Omit<AuthState, 'bootstrapping' | 'isAuthenticated'>) => void
) {
  tokenStorage.set(session.accessToken, session.refreshToken);
  set({
    user: session.user,
    memberships: session.memberships,
    activeTenantId: session.activeTenantId,
    membershipRole: session.membershipRole,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null);
  const [membershipRole, setMembershipRole] = useState<MembershipRole | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const setCore = useCallback(
    (s: Omit<AuthState, 'bootstrapping' | 'isAuthenticated'>) => {
      setUser(s.user);
      setMemberships(s.memberships);
      setActiveTenantId(s.activeTenantId);
      setMembershipRole(s.membershipRole);
    },
    []
  );

  const refreshMe = useCallback(async () => {
    const me = await meRequest();
    setCore({
      user: me.user,
      memberships: me.memberships,
      activeTenantId: me.activeTenantId,
      membershipRole: me.membershipRole,
    });
  }, [setCore]);

  useEffect(() => {
    const token = tokenStorage.getAccess();
    if (!token) {
      setBootstrapping(false);
      return;
    }
    refreshMe()
      .catch(() => {
        tokenStorage.clear();
        setCore({
          user: null,
          memberships: [],
          activeTenantId: null,
          membershipRole: null,
        });
      })
      .finally(() => setBootstrapping(false));
  }, [refreshMe, setCore]);

  const login = useCallback(
    async (email: string, password: string, tenantId?: string) => {
      const session = await loginRequest({ email, password, tenantId });
      applySession(session, setCore);
      return session;
    },
    [setCore]
  );

  const register = useCallback(
    async (input: {
      email: string;
      password: string;
      fullName: string;
      tenantName: string;
    }) => {
      const session = await registerRequest(input);
      applySession(session, setCore);
      return session;
    },
    [setCore]
  );

  const logout = useCallback(async () => {
    const refresh = tokenStorage.getRefresh();
    try {
      if (refresh) await logoutRequest(refresh);
    } finally {
      tokenStorage.clear();
      setCore({
        user: null,
        memberships: [],
        activeTenantId: null,
        membershipRole: null,
      });
    }
  }, [setCore]);

  const switchTenant = useCallback(
    async (tenantId: string) => {
      const session = await switchTenantRequest(tenantId);
      applySession(session, setCore);
    },
    [setCore]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      memberships,
      activeTenantId,
      membershipRole,
      bootstrapping,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      switchTenant,
      refreshMe,
    }),
    [
      user,
      memberships,
      activeTenantId,
      membershipRole,
      bootstrapping,
      login,
      register,
      logout,
      switchTenant,
      refreshMe,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
