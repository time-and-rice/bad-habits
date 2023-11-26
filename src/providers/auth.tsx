import { onAuthStateChanged, User } from "firebase/auth";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import invariant from "tiny-invariant";

import { Fallback } from "~/components/fallback";
import { auth } from "~/firebase/initialize";

export type AuthUser = User;

type State = {
  authUser: AuthUser | undefined;
  loading: boolean;
  error: Error | undefined;
};

function useAuthProvider(): State {
  const [authUser, setAuthUser] = useState<AuthUser>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    const unsub = onAuthStateChanged(
      auth,
      (authUser) => {
        setAuthUser(authUser || undefined);
        setError(undefined);
        if (loading) setLoading(false);
      },
      (e) => {
        setAuthUser(undefined);
        setError(e);
      },
    );

    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    authUser,
    loading,
    error,
  };
}

const AuthContext = createContext<State | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const state = useAuthProvider();
  return (
    <Fallback loading={state.loading} error={state.error}>
      <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
    </Fallback>
  );
}

export const useAuthSafely = () => {
  const state = useContext(AuthContext);
  invariant(state);
  return state;
};

export const useAuth = () => {
  const state = useContext(AuthContext);
  invariant(state);
  invariant(state.authUser);
  return {
    ...state,
    authUser: state.authUser,
  };
};
