import React, { Component, Suspense, lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import SuspenseLoader from "../components/SuspendLoader/suspendLoader";
import ProtectedRoutes from "./ProtectedRoutes";

const Loader = (Component: any) => (props: any) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Dashboard
const Dashboard = Loader(lazy(() => import("../pages/dashboard/dashboard")));
const Login = Loader(lazy(() => import("../pages/login/login")));
const Register = Loader(lazy(() => import("../pages/register/register")));

// Not Found Page
const NotFound = Loader(lazy(() => import("../pages/notFound/notFound")));

const Logout = () => {
  localStorage.clear();
  return <Navigate to="/login" />;
};

const RegisterAndLogout = () => {
  localStorage.clear();
  return <Register />;
};

const routes: RouteObject[] = [
  {
    path: "",
    children: [
      {
        path: "",
        element: (
          <ProtectedRoutes>
            <Dashboard />
          </ProtectedRoutes>
        ),
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <RegisterAndLogout />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;