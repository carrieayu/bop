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
const Forgot = Loader(lazy(() => import("../pages/forgot/forgot")));
const ResetPassword = Loader(lazy(() => import("../pages/resetPassword/resetPassword")));

// Not Found Page
const NotFound = Loader(lazy(() => import("../pages/notFound/notFound")));

// Project Data Pages
const ProjectDataList = Loader(lazy(() => import("../pages/projectDataList/projectDataList")));
const ProjectDataRegistration = Loader(lazy(() => import("../pages/projectDataRegistration/projectdataregistration")))

//Personnel Expenses Pages
const PersonnelExpenseCreate = Loader(lazy(() => import("../pages/personnelCreate/personnelExpenseCreate")))
const PersonnelExpensesList = Loader(lazy(() => import("../pages/personnel_expenses/personnelExpenses")))

//Planning Page
const Planning = Loader(lazy(() => import("../pages/planningUI/planning")))

//Cost of Sales Pages
const CostOfSales = Loader(lazy(() => import("../pages/costofSalesRegistration/costofSalesRegistration")))
const CostOfSalesList = Loader(lazy(() => import("../pages/costofSalesList/costofSalesList")))

//Expenses Page
const ExpensesRegistration = Loader(lazy(() => import("../pages/expensesRegistration/expensesRegistration")))
const ExpensesList = Loader(lazy(() => import("../pages/expensesList/expensesList")))

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
    path: '',
    children: [
      {
        path: 'dashboard',
        element: (
          <ProtectedRoutes>
            <Dashboard />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'login',
        element: <Login />,
      },
      {
        path: 'register',
        element: <RegisterAndLogout />,
      },
      {
        path: 'forgot',
        element: <Forgot />,
      },
      {
        path: "reset-password/:uid/:token",
        element: <ResetPassword />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: 'projectdatalist',
        element: (
          <ProtectedRoutes>
            <ProjectDataList />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'projectcreate',
        element: (
          <ProtectedRoutes>
            <ProjectDataRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'personnel-expenses-list',
        element: (
          <ProtectedRoutes>
            <PersonnelExpensesList />
          </ProtectedRoutes>
        ),
      },
      {
        path: "personnel-expense-create",
        element: (
          <ProtectedRoutes>
            <PersonnelExpenseCreate />
          </ProtectedRoutes>
        )
      },
      {
        path: "planning",
        element: (
          <ProtectedRoutes>
            <Planning />
          </ProtectedRoutes>
        )
      },
      {
        path: "cost-of-sales-registration",
        element: (
          <ProtectedRoutes>
            <CostOfSales />
          </ProtectedRoutes>
        )
      },
      {
        path: "cost-of-sales-list",
        element: (
          <ProtectedRoutes>
            <CostOfSalesList />
          </ProtectedRoutes>
        )
      },
      {
        path: "expenses-registration",
        element: (
          <ProtectedRoutes>
            <ExpensesRegistration />
          </ProtectedRoutes>
        )
      },
      {
        path: "expenses-list",
        element: (
          <ProtectedRoutes>
            <ExpensesList />
          </ProtectedRoutes>
        )
      }
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]

export default routes;
