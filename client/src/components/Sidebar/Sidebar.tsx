import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard } from "react-icons/md";
import { FaTableList, FaChevronUp, FaChevronDown } from "react-icons/fa6";
import { BsPersonFillAdd } from "react-icons/bs";
import { AiFillFileAdd } from "react-icons/ai";
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil'
import { BiSolidUpArrow, BiSolidDownArrow } from "react-icons/bi";

const Sidebar = () => {
  const { language } = useLanguage();
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en');
  const location = useLocation();
  const [isGroup1Visible, setIsGroup1Visible] = useState(
    () => JSON.parse(localStorage.getItem('isGroup1Visible') || 'false')
  );
  const [isGroup2Visible, setIsGroup2Visible] = useState(
    () => JSON.parse(localStorage.getItem('isGroup2Visible') || 'false')
  );

  useEffect(() => {
    localStorage.setItem('isGroup1Visible', JSON.stringify(isGroup1Visible));
  }, [isGroup1Visible]);

  useEffect(() => {
    localStorage.setItem('isGroup2Visible', JSON.stringify(isGroup2Visible));
  }, [isGroup2Visible]);

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const toggleGroup1Visibility = () => {
    setIsGroup1Visible(!isGroup1Visible);
  };

  const toggleGroup2Visibility = () => {
    setIsGroup2Visible(!isGroup2Visible);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        <ul>
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/dashboard">{translate('dashboard', language)}</Link>
          </li>
          <li onClick={toggleGroup1Visibility} style={{ cursor: 'pointer' }}>
            <span className="icons"><MdDashboard /></span>
            <Link to="/planning-list">{translate('profitAndlossPlanning', language)}</Link>
            <span className="icon-right">
              {isGroup1Visible ? <BiSolidUpArrow /> : <BiSolidDownArrow />}
            </span>
          </li>
          {isGroup1Visible && (
            <>
              <li className="sub_menu">
                <span className="icons"><FaTableList /></span><Link to="/projects-list">{translate('projectsList', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><AiFillFileAdd /></span><Link to="/projects-registration">{translate('projectsRegistration', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><BsPersonFillAdd /></span><Link to="/employee-expenses-registration">{translate('employeeExpensesRegistration', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><FaTableList /></span><Link to="/employee-expenses-list">{translate('employeeExpensesList', language)}</Link>
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
            </>
          )}
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/*">{translate('results', language)}</Link>
          </li>
          <li onClick={toggleGroup2Visibility} style={{ cursor: 'pointer' }}>
            <span className="icons"><MdDashboard /></span>
            <span>{translate('masterMaintenance', language)}</span>
            <span className="icon-right">
              {isGroup2Visible ? <BiSolidUpArrow /> : <BiSolidDownArrow />}
            </span>
          </li>
          {isGroup2Visible && (
            <>
              <li className="sub_menu">
                <span className="icons"><FaTableList /></span><Link to="/clients-list">{translate('clientsList', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><AiFillFileAdd /></span><Link to="/clients-registration">{translate('clientsRegistration', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><FaTableList /></span><Link to="/employees-list">{translate('employeesList', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><BsPersonFillAdd /></span><Link to="/employees-registration">{translate('employeesRegistration', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><FaTableList /></span><Link to="/business-divisions-list">{translate('businessDivisionsList', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><AiFillFileAdd /></span><Link to="/business-divisions-registration">{translate('businessDivisionsRegistration', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><FaTableList /></span><Link to="/users-list">{translate('usersList', language)}</Link>
              </li>
              <li className="sub_menu">
                <span className="icons"><BsPersonFillAdd /></span><Link to="/users-registration">{translate('usersRegistration', language)}</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
