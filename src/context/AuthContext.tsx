import {
  useState,
  type ReactNode,
} from "react";


import type { User } from "../types/auth";

import authStore from "../store/auth.store";

import { AuthContext } from "./auth.context";


interface Props {
  children: ReactNode;
}


export function AuthProvider({
  children
}: Props) {


  const [user, setUser] =
    useState<User | null>(
      authStore.getUser()
    );


  const [token, setToken] =
    useState<string | null>(
      authStore.getToken()
    );


  const login = (
    token: string,
    user: User
  ) => {


    authStore.save(
      token,
      user
    );


    setToken(token);

    setUser(user);

  };


  const logout = () => {


    authStore.logout();


    setUser(null);

    setToken(null);

  };


  return (

    <AuthContext.Provider

      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}

    >

      {children}

    </AuthContext.Provider>

  );

}