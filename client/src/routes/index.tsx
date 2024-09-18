import React, { Component, Suspense, lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import SuspenseLoader from "../components/SuspendLoader/SuspendLoader";
import ProtectedRoutes from "./ProtectedRoutes";

const Loader = (Component: any) => (props: any) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Dashboard
const Dashboard = Loader(lazy(() => import("../pages/Dashboard/Dashboard")));

// Login
const Login = Loader(lazy(() => import("../pages/Login/Login")));

// Register
const Register = Loader(lazy(() => import("../pages/Register/Register")));

// Forgot
const Forgot = Loader(lazy(() => import("../pages/Forgot/Forgot")));

// Reset Password
const ResetPassword = Loader(lazy(() => import("../pages/ResetPassword/ResetPassword")));

// Not Found Page
const NotFound = Loader(lazy(() => import("../pages/NotFound/NotFound")));

// Projects Pages
const ProjectsListAndEdit = Loader(lazy(() => import("../pages/Projects/ProjectsListAndEdit")));
const ProjectsRegistration = Loader(lazy(() => import("../pages/Projects/ProjectsRegistration")))

//Employee Expenses Pages
const EmployeeExpensesRegistration = Loader(lazy(() => import("../pages/EmployeeExpenses/EmployeeExpensesRegistration")))
const EmployeeExpensesList = Loader(lazy(() => import("../pages/EmployeeExpenses/EmployeeExpensesList")))

//Planning Page
const PlanningListAndEdit = Loader(lazy(() => import("../pages/Planning/PlanningListAndEdit")))

//Cost of Sales Pages
const CostOfSalesRegistration = Loader(lazy(() => import("../pages/CostOfSales/CostOfSalesRegistration")))
const CostOfSalesList = Loader(lazy(() => import("../pages/CostOfSales/CostOfSalesList")))

//Expenses Pages
const ExpensesRegistration = Loader(lazy(() => import("../pages/Expenses/ExpensesRegistration")))
const ExpensesList = Loader(lazy(() => import("../pages/Expenses/ExpensesList")))

//Clients Pages
const ClientsRegistration = Loader(lazy(() => import("../pages/Clients/ClientsRegistration")))
const ClientsListAndEdit = Loader(lazy(() => import("../pages/Clients/ClientsListAndEdit")))

//Employees Pages
const EmployeesRegistration = Loader(lazy(() => import("../pages/Employees/EmployeesRegistration")))
const EmployeesListAndEdit = Loader(lazy(() => import("../pages/Employees/EmployeesListAndEdit")))

//Business Divisions Pages
const BusinessDivisionsRegistration = Loader(lazy(() => import("../pages/BusinessDivisions/BusinessDivisionsRegistration")))
const BusinessDivisionsListAndEdit = Loader(lazy(() => import("../pages/BusinessDivisions/BusinessDivisionsListAndEdit")))

//Users Pages
const UsersRegistration = Loader(lazy(() => import("../pages/Users/UsersRegistration")))
const UsersListAndEdit = Loader(lazy(() => import('../pages/Users/UsersListAndEdit')))

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
            <ProjectsListAndEdit />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'projectcreate',
        element: (
          <ProtectedRoutes>
            <ProjectsRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'personnel-expenses-list',
        element: (
          <ProtectedRoutes>
            <EmployeeExpensesList />
          </ProtectedRoutes>
        ),
      },
      {
        path: "personnel-expense-create",
        element: (
          <ProtectedRoutes>
            <EmployeeExpensesRegistration />
          </ProtectedRoutes>
        )
      },
      {
        path: "planning",
        element: (
          <ProtectedRoutes>
            <PlanningListAndEdit />
          </ProtectedRoutes>
        )
      },
      {
        path: "cost-of-sales-registration",
        element: (
          <ProtectedRoutes>
            <CostOfSalesRegistration />
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
      },
      {
        path: "clients-registration",
        element: (
          <ProtectedRoutes>
            <ClientsRegistration />
          </ProtectedRoutes>
        )
      },
      {
        path: "clients-list",
        element: (
          <ProtectedRoutes>
            <ClientsListAndEdit />
          </ProtectedRoutes>
        )
      },
      {
        path: "employees-registration",
        element: (
          <ProtectedRoutes>
            <EmployeesRegistration />
          </ProtectedRoutes>
        )
      },
      {
        path: "employees-list",
        element: (
          <ProtectedRoutes>
            <EmployeesListAndEdit />
          </ProtectedRoutes>
        )
      },
      {
        path: "business-divisions-registration",
        element: (
          <ProtectedRoutes>
            <BusinessDivisionsRegistration />
          </ProtectedRoutes>
        )
      },
      {
        path: "business-divisions-list",
        element: (
          <ProtectedRoutes>
            <BusinessDivisionsListAndEdit />
          </ProtectedRoutes>
        )
      },
      {
        path: "users-registration",
        element: (
          <ProtectedRoutes>
            <UsersRegistration />
          </ProtectedRoutes>
        )
      },
      {
        path: "users-list",
        element: (
          <ProtectedRoutes>
            <UsersListAndEdit />
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
