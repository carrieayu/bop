import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MdDashboard } from "react-icons/md";
import { FaTableList } from "react-icons/fa6";
import { BsPersonFillAdd } from "react-icons/bs";
import { AiFillFileAdd } from "react-icons/ai";
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil'

const Sidebar = () => {
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translation

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        <ul>
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/dashboard">{translate('dashboard', language)}</Link>
          </li>
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/planning">{translate('profitAndlossPlanning', language)}</Link>
          </li>
            <li className="sub_menu">
              <span className="icons"><FaTableList /></span><Link to="/projectdatalist">{translate('projectsList', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><AiFillFileAdd /></span><Link to="/projectcreate">{translate('projectsRegistration', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><BsPersonFillAdd /></span><Link to="/personnel-expense-create">{translate('employeeExpensesRegistration', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><FaTableList /></span><Link to="/personnel-expenses-list">{translate('employeeExpensesList', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><AiFillFileAdd /></span><Link to="/expenses-registration">{translate('expensesRegistration', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><FaTableList /></span><Link to="/expenses-list">{translate('expensesList', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><AiFillFileAdd /></span><Link to="/cost-of-sales-registration">{translate('costOfSalesRegistration', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><FaTableList /></span><Link to="/cost-of-sales-list">{translate('costOfSalesList', language)}</Link>
            </li>
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/*">{translate('results', language)}</Link>
          </li>
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/*">{translate('masterMaintenance', language)}</Link>
          </li>
            <li className="sub_menu">
              <span className="icons"><FaTableList /></span><Link to="/clients-list">{translate('clientsList', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><AiFillFileAdd /></span><Link to="/clients-registration">{translate('clientsRegistration', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><FaTableList /></span><Link to="/*">{translate('employeesList', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><BsPersonFillAdd /></span><Link to="/*">{translate('employeesRegistration', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><FaTableList /></span><Link to="/*">{translate('businessDivisionsList', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><AiFillFileAdd /></span><Link to="/*">{translate('businessDivisionsRegistration', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><FaTableList /></span><Link to="/*">{translate('usersList', language)}</Link>
            </li>
            <li className="sub_menu">
              <span className="icons"><BsPersonFillAdd /></span><Link to="/*">{translate('usersRegistration', language)}</Link>
            </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;