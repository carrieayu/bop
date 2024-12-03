import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  const [isGroup3Visible, setIsGroup3Visible] = useState(() =>
    JSON.parse(localStorage.getItem('isGroup3Visible') || 'false'),
  )

  useEffect(() => {
    localStorage.setItem('isGroup1Visible', JSON.stringify(isGroup1Visible));
  }, [isGroup1Visible]);

  useEffect(() => {
    localStorage.setItem('isGroup2Visible', JSON.stringify(isGroup2Visible));
  }, [isGroup2Visible]);

  useEffect(() => {
    localStorage.setItem('isGroup3Visible', JSON.stringify(isGroup3Visible))
  }, [isGroup3Visible])

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const toggleGroup1Visibility = () => {
    setIsGroup1Visible(!isGroup1Visible);
  };

  const toggleGroup2Visibility = () => {
    setIsGroup2Visible(!isGroup2Visible);
  };

  const toggleGroup3Visibility = () => {
    setIsGroup3Visible(!isGroup3Visible)
  }

  return (
    <div className='sidebar'>
      <div className='sidebar-nav'>
        <ul>
          <li>
            <span className='icons'>
              <MdDashboard />
            </span>
            <NavLink to='/dashboard'>{translate('dashboard', language)}</NavLink>
          </li>
          <li onClick={toggleGroup1Visibility} style={{ cursor: 'pointer' }}>
            <span className='icons'>
              <MdDashboard />
            </span>
            <NavLink to='/planning-list'>{translate('profitAndlossPlanning', language)}</NavLink>
            <span className='icon-right'>{isGroup1Visible ? <BiSolidUpArrow /> : <BiSolidDownArrow />}</span>
          </li>
          {isGroup1Visible && (
            <>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/projects-list'>{translate('projectsList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <AiFillFileAdd />
                </span>
                <NavLink to='/projects-registration'>{translate('projectsRegistration', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/employee-expenses-list'>{translate('employeeExpensesList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <BsPersonFillAdd />
                </span>
                <NavLink to='/employee-expenses-registration'>
                  {translate('employeeExpensesRegistration', language)}
                </NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/expenses-list'>{translate('expensesList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <AiFillFileAdd />
                </span>
                <NavLink to='/expenses-registration'>{translate('expensesRegistration', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/cost-of-sales-list'>{translate('costOfSalesList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <AiFillFileAdd />
                </span>
                <NavLink to='/cost-of-sales-registration'>{translate('costOfSalesRegistration', language)}</NavLink>
              </li>
            </>
          )}
          <li onClick={toggleGroup2Visibility} style={{ cursor: 'pointer' }}>
            <span className='icons'>
              <MdDashboard />
            </span>
            <span>{translate('results', language)}</span>
            <span className='icon-right'>{isGroup2Visible ? <BiSolidUpArrow /> : <BiSolidDownArrow />}</span>
          </li>
          {isGroup2Visible && (
            <>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/expenses-results-list'>{translate('expensesResultsList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <AiFillFileAdd />
                </span>
                <NavLink to='/expenses-results-registration'>
                  {translate('expensesResultsRegistration', language)}
                </NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/project-sales-results-list'>{translate('projectSalesResultsList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <AiFillFileAdd />
                </span>
                <NavLink to='/project-sales-results-registration'>
                  {translate('projectSalesResultsRegistration', language)}
                </NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/employee-expenses-results-list'>
                  {translate('employeeExpensesResultsList', language)}
                </NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <AiFillFileAdd />
                </span>
                <NavLink to='/employee-expenses-results-registration'>
                  {translate('employeeExpensesResultsRegistration', language)}
                </NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/cost-of-sales-results-list'>
                  {translate('costOfSalesResultsList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <AiFillFileAdd />
                </span>
                <NavLink to='/cost-of-sales-results-registration'>
                  {translate('costOfSalesResultsEdit', language)}
                </NavLink>
              </li>
            </>
          )}
          <li onClick={toggleGroup3Visibility} style={{ cursor: 'pointer' }}>
            <span className='icons'>
              <MdDashboard />
            </span>
            <span>{translate('masterMaintenance', language)}</span>
            <span className='icon-right'>{isGroup3Visible ? <BiSolidUpArrow /> : <BiSolidDownArrow />}</span>
          </li>
          {isGroup3Visible && (
            <>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/clients-list'>{translate('clientsList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <AiFillFileAdd />
                </span>
                <NavLink to='/clients-registration'>{translate('clientsRegistration', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/employees-list'>{translate('employeesList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <BsPersonFillAdd />
                </span>
                <NavLink to='/employees-registration'>{translate('employeesRegistration', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/business-divisions-list'>{translate('businessDivisionsList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <AiFillFileAdd />
                </span>
                <NavLink to='/business-divisions-registration'>
                  {translate('businessDivisionsRegistration', language)}
                </NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <FaTableList />
                </span>
                <NavLink to='/users-list'>{translate('usersList', language)}</NavLink>
              </li>
              <li className='sub_menu'>
                <span className='icons'>
                  <BsPersonFillAdd />
                </span>
                <NavLink to='/users-registration'>{translate('usersRegistration', language)}</NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
};

export default Sidebar;
