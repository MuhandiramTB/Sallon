import { createContext, useContext, useReducer, useEffect } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false };
    case 'LOGIN':
      localStorage.setItem('token', action.payload.token);
      return { user: action.payload.user, token: action.payload.token, isLoading: false };
    case 'LOGOUT':
      localStorage.removeItem('token');
      return { user: null, token: null, isLoading: false };
    case 'LOADED':
      return { ...state, isLoading: false };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    if (state.token) {
      api('/auth/me')
        .then((res) => dispatch({ type: 'SET_USER', payload: res.data }))
        .catch(() => {
          localStorage.removeItem('token');
          dispatch({ type: 'LOADED' });
        });
    } else {
      dispatch({ type: 'LOADED' });
    }
  }, []);

  const login = (user, token) => {
    dispatch({ type: 'LOGIN', payload: { user, token } });
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
