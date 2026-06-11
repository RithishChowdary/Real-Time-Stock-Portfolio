import { createContext, useMemo, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  userId: localStorage.getItem("userId"),
  portfolioId: localStorage.getItem("portfolioId"),
  name: localStorage.getItem("name"),
  email: localStorage.getItem("email"),
  role: localStorage.getItem("role"),
});

  const login = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("userId", data.userId);
    localStorage.setItem("portfolioId", data.portfolioId);

localStorage.setItem("name", data.name || "");
localStorage.setItem("email", data.email || "");
localStorage.setItem("role", data.role || "");  

    setAuth({
  token: data.token,
  refreshToken: data.refreshToken,
  userId: data.userId,
  portfolioId: data.portfolioId,
  name: data.name,
  email: data.email,
  role: data.role,
});
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("portfolioId");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
localStorage.removeItem("email");

    setAuth({
      token: null,
      refreshToken: null,
      userId: null,
      portfolioId: null,
    });

   // window.location.href = "/login";
   
  };

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth.token),
      login,
      logout,
    }),
    [auth]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}