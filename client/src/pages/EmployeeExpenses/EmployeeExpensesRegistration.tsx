import React, { useEffect, useState } from 'react';
import Btn from '../../components/Button/Button';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';
import RegistrationButtons from '../../components/RegistrationButtons/RegistrationButtons';
import HeaderButtons from '../../components/HeaderButtons/HeaderButtons';
import axios from 'axios';

const months = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const EmployeeExpensesRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('/planning-list');
  const [activeTabOther, setActiveTabOther] = useState('employeeExpenses');
  const { language, setLanguage } = useLanguage();
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 1;
  const endYear = currentYear + 2;
  const years = Array.from({ length: endYear - startYear + 1 }, (val, i) => startYear + i);
  const token = localStorage.getItem('accessToken')
  const [employees, setEmployees] = useState([]); 
  const [projects, setProjects] = useState([]); 
  const [employeeContainers, setEmployeeContainers] = useState([{ id: 1, projectEntries: [{ id: 1 }] }]);

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }

  const handleTabsClick = (tab) => {
    setActiveTabOther(tab);
    switch (tab) {
      case 'project':
        navigate('/projects-registration');
        break;
      case 'employeeExpenses':
        navigate('/employee-expenses-registration');
        break;
      case 'expenses':
        navigate('/expenses-registration');
        break;
      case 'costOfSales':
        navigate('/cost-of-sales-registration');
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning-list' || path === '/*') {
      setActiveTab(path);
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
    setLanguage(newLanguage);
  };

  const monthNames = {
    1: { en: "January", jp: "1月" },
    2: { en: "February", jp: "2月" },
    3: { en: "March", jp: "3月" },
    4: { en: "April", jp: "4月" },
    5: { en: "May", jp: "5月" },
    6: { en: "June", jp: "6月" },
    7: { en: "July", jp: "7月" },
    8: { en: "August", jp: "8月" },
    9: { en: "September", jp: "9月" },
    10: { en: "October", jp: "10月" },
    11: { en: "November", jp: "11月" },
    12: { en: "December", jp: "12月" },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeResponse = await axios.get('http://127.0.0.1:8000/api/employees', {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });
        setEmployees(employeeResponse.data);

        const projectResponse = await axios.get('http://127.0.0.1:8000/api/projects/', {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
        });
        setProjects(projectResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [token]);

   // Function to add a new employee container (up to 5)
   const addEmployeeContainer = () => {
    if (employeeContainers.length < 5) {
      setEmployeeContainers([
        ...employeeContainers,
        { id: employeeContainers.length + 1, projectEntries: [{ id: 1 }] },
      ]);
    }
  };

  // Function to remove an employee container (minimum 1)
  const removeEmployeeContainer = () => {
    if (employeeContainers.length > 1) {
      setEmployeeContainers(employeeContainers.slice(0, -1));
    }
  };

  // Function to add a project entry in a specific container (up to 3)
  const addProjectEntry = (containerIndex) => {
    const updatedContainers = [...employeeContainers];
    const projectEntries = updatedContainers[containerIndex].projectEntries;

    if (projectEntries.length < 3) {
      projectEntries.push({ id: projectEntries.length + 1 });
      setEmployeeContainers(updatedContainers);
    }
  };


  return (
    <div className='employeeExpensesRegistration_wrapper'>
      <HeaderButtons
          activeTab={activeTab}
          handleTabClick={handleTabClick}
          isTranslateSwitchActive={isTranslateSwitchActive}
          handleTranslationSwitchToggle={handleTranslationSwitchToggle}
      />
      <div className="employeeExpensesRegistration_cont_wrapper">
        <Sidebar />
        <div className="employeeExpensesRegistration_wrapper_div">
          <div className="employeeExpensesRegistration_top_content">
            <div className="employeeExpensesRegistration_top_body_cont">
              <div className="employeeExpensesRegistration_top_btn_cont"></div>
            </div>
            <div className="employeeExpensesRegistration_mid_body_cont">
              <RegistrationButtons
                activeTabOther={activeTabOther}
                message={translate('employeeExpensesRegistration', language)}
                handleTabsClick={handleTabsClick}
                buttonConfig={[
                  { labelKey: 'project', tabKey: 'project' },
                  { labelKey: 'employeeExpenses', tabKey: 'employeeExpenses' },
                  { labelKey: 'expenses', tabKey: 'expenses' },
                  { labelKey: 'costOfSales', tabKey: 'costOfSales' },
                ]}
              />
              <div className="employeeExpensesRegistration_table_wrapper">
                <form className="employeeExpensesRegistration_form_wrapper">
                  {employeeContainers.map((container, containerIndex) => (
                    <div className="employeeExpensesRegistration_container" key={container.id}>
                      <div className={`employeeExpensesRegistration_form-content ${containerIndex > 0 ? 'employeeExpensesRegistration_form-line' : ''}`}></div>
                      <div className="employeeExpensesRegistration_cont-body">
                        <div className="employeeExpensesRegistration_row">
                          <div className="employeeExpensesRegistration_label">
                            <p>{translate('employee', language)}</p>
                          </div>
                          <div className="employeeExpensesRegistration_card-box">
                            <select 
                            name="employeeName" 
                            className="employeeExpensesRegistration_emp-select"
                            >
                              <option value="">{translate('selectEmployee', language)}</option>
                              {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {`${employee.last_name} ${employee.first_name}`}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="employeeExpensesRegistration_project-fields">
                          {container.projectEntries.map((_, projectIndex) => (
                            <div className="employeeExpensesRegistration_project-group" key={projectIndex}>
                              <div className="employeeExpensesRegistration_row">
                                <div className="employeeExpensesRegistration_label">
                                  <p>{translate('project', language)}</p>
                                </div>
                                <div className="employeeExpensesRegistration_card-box">
                                  <select 
                                  name="projectName"
                                  >
                                    <option value=""></option>
                                    {projects.map((project) => (
                                      <option key={project.id} value={project.id}>
                                        {project.project_name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="employeeExpensesRegistration_row">
                                <div className="employeeExpensesRegistration_label">
                                  <p>{translate('year', language)}</p>
                                </div>
                                <div className="employeeExpensesRegistration_card-box">
                                  <select 
                                  name="year"
                                  >
                                    <option value=""></option>
                                    {years.map((year) => (
                                      <option key={year} value={year}>
                                        {year}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="employeeExpensesRegistration_row">
                                <div className="employeeExpensesRegistration_label">
                                  <p>{translate('month', language)}</p>
                                </div>
                                <div className="employeeExpensesRegistration_card-box">
                                  <select 
                                  name="month"
                                  >
                                    <option value=""></option>
                                    {months.map((month, idx) => (
                                      <option key={idx} value={month}>{language === "en" ? monthNames[month].en : monthNames[month].jp}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div className="employeeExpensesRegistration_button-box">
                            <Btn label={translate('add', language)} className="employeeExpensesRegistration_button" type="button" onClick={() => addProjectEntry(containerIndex)} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="employeeExpensesRegistration_cont-footer">
                    <div className="employeeExpensesRegistration_btn-plusminus">
                      <Btn label="+" className="employeeExpensesRegistration_plus-btn" type="button" onClick={addEmployeeContainer} />
                      <Btn label="-" className="employeeExpensesRegistration_minus-btn" type="button" onClick={removeEmployeeContainer} />
                    </div>
                    <div className="employeeExpensesRegistration_btn-subcancel">
                      <button type='button' className='button is-light'>
                        {translate('cancel', language)}
                      </button>
                      <button type='submit' className='button is-info'>
                        {translate('submit', language)}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeExpensesRegistration;
