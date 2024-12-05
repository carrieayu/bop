import React, { Component, Suspense, lazy } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import SuspenseLoader from "../components/SuspenseLoader/SuspenseLoader";
import ProtectedRoutes from "./ProtectedRoutes";
import EmployeeExpensesResultsList from "../pages/EmployeeExpensesResults/EmployeeExpenseResultsList";
import EmployeeExpensesResultsRegistration from "../pages/EmployeeExpensesResults/EmployeeExpensesResultsRegistration";
import CostOfSalesResultsList from "../pages/CostOfSalesResults/CostOfSalesResultsListAndEdit";
import CostOfSalesResultsRegistration from "../pages/CostOfSalesResults/CostOfSalesResultsRegistration";

const Loader = (Component: any) => (props: any) =>
  (
    <Suspense fallback={<SuspenseLoader />}>
      <Component {...props} />
    </Suspense>
  );

// Dashboard Page
const Dashboard = Loader(lazy(() => import("../pages/Dashboard/Dashboard")));

// Login Page
const Login = Loader(lazy(() => import("../pages/Login/Login")))

// Register Page
const Register = Loader(lazy(() => import("../pages/Register/Register")))

// Forgot Password Page
const ForgotPassword = Loader(lazy(() => import("../pages/ForgotPassword/ForgotPassword")))

// Reset Password Page
const ResetPassword = Loader(lazy(() => import("../pages/ResetPassword/ResetPassword")))

// Not Found Page
const NotFound = Loader(lazy(() => import("../pages/NotFound/NotFound")))

// Project Data Pages
const ProjectsListAndEdit = Loader(lazy(() => import("../pages/Projects/ProjectsListAndEdit")));
const ProjectsRegistration = Loader(lazy(() => import("../pages/Projects/ProjectsRegistration")))

// Project Sales Results Pages
const ProjectSalesResultsListAndEdit = Loader(lazy(() => import("../pages/ProjectSalesResults/ProjectSalesResultsListAndEdit")));
const ProjectSalesResultsRegistration = Loader(lazy(() => import("../pages/ProjectSalesResults/ProjectSalesResultsRegistration")))

//Personnel Expenses Pages
const EmployeeExpensesRegistration = Loader(lazy(() => import("../pages/EmployeeExpenses/EmployeeExpensesRegistration")))
const EmployeeExpensesList = Loader(lazy(() => import("../pages/EmployeeExpenses/EmployeeExpensesList")))

//Planning Page
const PlanningListAndEdit = Loader(lazy(() => import("../pages/Planning/PlanningListAndEdit")))

//Cost of Sales Pages
const CostOfSalesRegistration = Loader(lazy(() => import("../pages/CostOfSales/CostOfSalesRegistration")))
const CostOfSalesListAndEdit = Loader(lazy(() => import("../pages/CostOfSales/CostOfSalesListAndEdit")))

//Expenses Pages
const ExpensesRegistration = Loader(lazy(() => import("../pages/Expenses/ExpensesRegistration")))
const ExpensesListAndEdit = Loader(lazy(() => import("../pages/Expenses/ExpensesListAndEdit")))

//Expenses Results Pages
const ExpensesResultsRegistration = Loader(lazy(() => import("../pages/ExpensesResults/ExpensesResultsRegistration")))
const ExpensesResultsList = Loader(lazy(() => import('../pages/ExpensesResults/ExpensesResultsListAndEdit')))

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
        element: <ForgotPassword />,
      },
      {
        path: 'reset-password/:uid/:token',
        element: <ResetPassword />,
      },
      {
        path: 'logout',
        element: <Logout />,
      },
      {
        path: 'projects-list',
        element: (
          <ProtectedRoutes>
            <ProjectsListAndEdit />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'projects-registration',
        element: (
          <ProtectedRoutes>
            <ProjectsRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'project-sales-results-list',
        element: (
          <ProtectedRoutes>
            <ProjectSalesResultsListAndEdit />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'project-sales-results-registration',
        element: (
          <ProtectedRoutes>
            <ProjectSalesResultsRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'employee-expenses-list',
        element: (
          <ProtectedRoutes>
            <EmployeeExpensesList />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'employee-expenses-registration',
        element: (
          <ProtectedRoutes>
            <EmployeeExpensesRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'employee-expenses-results-list',
        element: (
          <ProtectedRoutes>
            <EmployeeExpensesResultsList />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'employee-expenses-results-registration',
        element: (
          <ProtectedRoutes>
            <EmployeeExpensesResultsRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'cost-of-sales-results-list',
        element: (
          <ProtectedRoutes>
            <CostOfSalesResultsList />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'cost-of-sales-results-registration',
        element: (
          <ProtectedRoutes>
            <CostOfSalesResultsRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'planning-list',
        element: (
          <ProtectedRoutes>
            <PlanningListAndEdit />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'cost-of-sales-registration',
        element: (
          <ProtectedRoutes>
            <CostOfSalesRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'cost-of-sales-list',
        element: (
          <ProtectedRoutes>
            <CostOfSalesListAndEdit />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'expenses-registration',
        element: (
          <ProtectedRoutes>
            <ExpensesRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'expenses-results-list',
        element: (
          <ProtectedRoutes>
            <ExpensesResultsList />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'expenses-results-registration',
        element: (
          <ProtectedRoutes>
            <ExpensesResultsRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'expenses-list',
        element: (
          <ProtectedRoutes>
            <ExpensesListAndEdit />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'clients-registration',
        element: (
          <ProtectedRoutes>
            <ClientsRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'clients-list',
        element: (
          <ProtectedRoutes>
            <ClientsListAndEdit />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'employees-registration',
        element: (
          <ProtectedRoutes>
            <EmployeesRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'employees-list',
        element: (
          <ProtectedRoutes>
            <EmployeesListAndEdit />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'business-divisions-registration',
        element: (
          <ProtectedRoutes>
            <BusinessDivisionsRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'business-divisions-list',
        element: (
          <ProtectedRoutes>
            <BusinessDivisionsListAndEdit />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'users-registration',
        element: (
          <ProtectedRoutes>
            <UsersRegistration />
          </ProtectedRoutes>
        ),
      },
      {
        path: 'users-list',
        element: (
          <ProtectedRoutes>
            <UsersListAndEdit />
          </ProtectedRoutes>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]

export default routes;
