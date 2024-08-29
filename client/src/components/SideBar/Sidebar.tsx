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
            <span className="icons"><MdDashboard /></span><Link to="/planning">{translate('planning', language)}</Link>
          </li>
          <li className="sub_menu">
            <span className="icons"><FaTableList /></span><Link to="/projectdatalist">{translate('projectdatalist', language)}</Link>
          </li>
          <li className="sub_menu">
          <span className="icons"><AiFillFileAdd /></span><Link to="/projectcreate">{translate('projectcreate', language)}</Link>
          </li>
          <li className="sub_menu">
          <span className="icons"><BsPersonFillAdd /></span><Link to="/personnel-expense-create">{translate('personnel-expense-create', language)}</Link>
          </li>
          <li className="sub_menu">
          <span className="icons"><FaTableList /></span><Link to="/personnel-expenses-list">{translate('personnel-expenses-list', language)}</Link>
          </li>
          <li className="sub_menu">
            <span className="icons"><AiFillFileAdd /></span><Link to="/expenses-registration">{translate('expenses-registration', language)}</Link>
          </li>
          <li className="sub_menu">
          <span className="icons"><FaTableList /></span><Link to="/expenses-list">{translate('expenses-list', language)}</Link>
          </li>
          <li className="sub_menu">
          <span className="icons"><AiFillFileAdd /></span><Link to="/cost-of-sales-registration">{translate('cost-of-sales-registration', language)}</Link>
          </li>
          <li className="sub_menu">
          <span className="icons"><FaTableList /></span><Link to="/cost-of-sales-list">{translate('cost-of-sales-list', language)}</Link>
          </li>
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/*">{translate('results', language)}</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;