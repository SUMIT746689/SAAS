import { FC, ReactNode, createContext, forwardRef, useEffect, useReducer, useState } from 'react';
import type { User } from 'src/models/user';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Snackbar } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';

// wrap your app
interface AuthState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  method: 'JWT';
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  superAdminLogInAsAdmin: (admin_id: number) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

type InitializeAction = {
  type: 'INITIALIZE';
  payload: {
    isAuthenticated: boolean;
    user: User | null;
  };
};

type LoginAction = {
  type: 'LOGIN';
  payload: {
    error: string | null;
    isAuthenticated: boolean;
    user: User;
  };
};

type LogoutAction = {
  type: 'LOGOUT';
};

type RegisterAction = {
  type: 'REGISTER';
  payload: {
    user: User;
  };
};

type Action = InitializeAction | LoginAction | LogoutAction | RegisterAction;

const initialAuthState: AuthState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  error: null
};

const handlers: Record<string, (state: AuthState, action: Action) => AuthState> = {
  INITIALIZE: (state: AuthState, action: InitializeAction): AuthState => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user
    };
  },
  LOGIN: (state: AuthState, action: LoginAction): AuthState => {
    const { user, isAuthenticated, error } = action.payload;

    return {
      ...state,
      error,
      isAuthenticated,
      user
    };
  },
  LOGOUT: (state: AuthState): AuthState => ({
    ...state,
    isAuthenticated: false,
    user: null
  }),
  REGISTER: (state: AuthState, action: RegisterAction): AuthState => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  }
};

const reducer = (state: AuthState, action: Action): AuthState => (handlers[action.type] ? handlers[action.type](state, action) : state);

export const AuthContext = createContext<AuthContextValue>({
  ...initialAuthState,
  method: 'JWT',
  login: () => Promise.resolve(),
  superAdminLogInAsAdmin: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve()
});

const Alert = forwardRef(function Alert(props, ref) {
  //@ts-ignore
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});
export const AuthProvider: FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialAuthState);
  const router = useRouter();
  const { asPath, query, locale } = router;
  const { t }: { t: any } = useTranslation();

  const [notification, setNotification] = useState({
    open: false,
    vertical: 'top',
    horizontal: 'center',
    message: ''
  });
  // const { vertical, horizontal, open } = notification;

  const handleClose = () => {
    setNotification({ ...notification, open: false });
  };
  const handleClick = (newState) => () => {
    setNotification({ open: true, ...newState });
  };

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        // const accessToken = window.localStorage.getItem('accessToken');
        // if (accessToken) {
        const response = await authApi.me();
        if (response.user) {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: true,
              user: response.user
            }
          });
        } else {
          dispatch({
            type: 'INITIALIZE',
            payload: {
              isAuthenticated: false,
              user: null
            }
          });
        }
      } catch (err) {
        console.log(err);
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null
          }
        });
      }
    };

    initialize();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    // const response: any = await authApi.login({ username, password });
    await authApi
      .login({ username, password })
      .then((response) => {
        console.log({ response });
        router.push('/');
        // router.prefetch('/dashboards')
        // .then(() => location.reload() );

        dispatch({
          type: 'LOGIN',
          payload: {
            // @ts-ignore
            error: null,
            isAuthenticated: true,
            // @ts-ignore
            user: response?.user || null
          }
        });
      })
      .catch((err) => {
        console.log(err);

        setNotification({
          open: true,
          vertical: 'top',
          horizontal: 'right',
          message: err.message
        });
      });
    // const accessToken = await authApi.login({ username, password });
    // const user = await authApi.me(accessToken);
    // localStorage.setItem('accessToken', accessToken);
  };

  const superAdminLogInAsAdmin = async (user_id) => {
    await authApi
      .superAdminLogInAsAdmin({ user_id })
      .then((response) => {
        router.push('/');
        dispatch({
          type: 'LOGIN',
          payload: {
            // @ts-ignore
            error: null,
            isAuthenticated: true,
            // @ts-ignore
            user: response?.user || null
          }
        });
      })
      .catch((err) => {
        console.log(err.message);

        setNotification({
          open: true,
          vertical: 'top',
          horizontal: 'right',
          message: err.message
        });
      });
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem('accessToken');
    const response = await axios.delete('/api/login');
    if (!response.data?.success) return;
    dispatch({ type: 'LOGOUT' });
  };

  const register = async (email: string, name: string, password: string): Promise<void> => {
    const accessToken = await authApi.register({ email, name, password });
    // const user = await authApi.me(accessToken);
    const user = await authApi.me();

    localStorage.setItem('accessToken', accessToken);

    dispatch({
      type: 'REGISTER',
      payload: {
        user
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: 'JWT',
        login,
        logout,
        superAdminLogInAsAdmin,
        register
      }}
    >
      <Snackbar
        //@ts-ignore
        anchorOrigin={{ vertical: notification.vertical, horizontal: notification.horizontal }}
        open={notification.open}
        onClose={handleClose}
        message={`frbghefhethdethetdhbned`}
        key={notification.vertical + notification.horizontal}
      >
        {/* @ts-ignore */}
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>

      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const AuthConsumer = AuthContext.Consumer;
