import React, { useEffect, useState } from 'react';
import Btn from '../../components/Button/Button';
import { fetchPersonnelData } from '../../reducers/personnel/personnelSlice';
import { fetchPlanning } from '../../reducers/personnel/personnelPlanningSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { UnknownAction } from 'redux';
import axios from 'axios';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { translate } from '../../utils/translationUtil';

const months = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const EmployeeExpensesRegistration = () => {
  const dispatch = useDispatch();
  const [personnelList, setPersonnelList] = useState<any>([]);
  const personnel = useSelector((state: RootState) => state.personnelData.personnel);
  const personnelPlanning = useSelector((state: RootState) => state.personnelPlanning.personnelPlanning);
  const [activeTab, setActiveTab] = useState('/planning')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('project')
  const { language, setLanguage } = useLanguage()
  const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); 


  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }
  
  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
  }

  const [containers, setContainers] = useState([{
    employeeName: '',
    user_id: '',
    projects: [{ projectName: '', project_planning_id: '', client_id: '', unit_price: '', ratio: '' }]
  }]);

  const fetchData = async () => {
    try {
      const resPersonnel = await dispatch(fetchPersonnelData() as unknown as UnknownAction);
      console.log('fetchPersonnel response:', resPersonnel);
      setPersonnelList(resPersonnel.payload);
      const resPersonPlanning = await dispatch(fetchPlanning() as unknown as UnknownAction);
      console.log('fetchPlanning response:', resPersonPlanning);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning' || path === '/*') {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const handleAddContainer = () => {
    if (containers.length < 5) {
      setContainers([...containers, {
        employeeName: '',
        user_id: '',
        projects: [{ projectName: '', project_planning_id: '', client_id: '', unit_price: '', ratio: '' }]
      }]);
    }
  };

  const handleRemoveContainer = () => {
    if (containers.length > 1) {
      const newContainers = [...containers];
      newContainers.pop();
      setContainers(newContainers);
    }
  };

  const handleAddProject = (containerIndex) => {
    const newContainers = [...containers];
    if (newContainers[containerIndex].projects.length < 5) {
      newContainers[containerIndex].projects.push({ projectName: '', project_planning_id: '', client_id: '', unit_price: '', ratio: '' });
      setContainers(newContainers);
    }
  };

  const handleInputChange = (containerIndex, projectIndex, event) => {
    const { name, value } = event.target;
    const newContainers = [...containers];
    if (projectIndex === null) {
      newContainers[containerIndex][name] = value;

      // Update user_id when employeeName is selected
      if (name === 'employeeName') {
        const selectedPerson = personnel.find(person => person.username === value);
        newContainers[containerIndex]['user_id'] = selectedPerson ? selectedPerson.user_id : '';
      }

    } else {
      newContainers[containerIndex].projects[projectIndex][name] = value;

      // Update project_planning_id and client_id when projectName is selected
      if (name === 'projectName') {
        const selectedProject = personnelPlanning.find(plan => plan.planning_project_name === value);
        newContainers[containerIndex].projects[projectIndex]['project_planning_id'] = selectedProject ? selectedProject.planning_project_id : '';
        newContainers[containerIndex].projects[projectIndex]['client_id'] = selectedProject ? selectedProject.client_id : '';
      }
    }
    setContainers(newContainers);
  };

  const handleSubmit = async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const transformedData = containers.flatMap(container => 
      container.projects.map(project => ({
        client_id: project.client_id,
        assignment_ratio: project.ratio,
        assignment_unit_price: project.unit_price,
        planning_project_id: project.project_planning_id,
        assignment_user_id: container.user_id,
        employeeName: container.employeeName // Include any additional fields if necessary
      }))
    );

    const token = localStorage.getItem('accessToken');
    try {
      // const response = await axios.post('http://127.0.0.1:8000/api/personnelplanning/add/', transformedData, {
      const response = await axios.post('http://54.178.202.58:8000/api/personnelplanning/add/', transformedData, {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to request headers
        },
      })
      console.log(response.data);
      alert('Saved');
      window.location.reload();
      // Reset the form or handle success accordingly
    } catch (error) {
      console.error('Error:', error.response.data);
      // Handle error
    }
  };

  useEffect(() => {
    setIsTranslateSwitchActive(language === 'en');
  }, [language]);

  const handleTranslationSwitchToggle = () => {
    const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
    setLanguage(newLanguage);
  };

  const monthNames: { [key: number]: { en: string; jp: string } } = {
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

  return (
    <div className='employeeExpensesRegistration_wrapper'>
    <div className="employeeExpensesRegistration_header_cont">
      <div className="employeeExpensesRegistration_top_btn_cont">
      <div className="employeeExpensesRegistration_header-buttons">
          <Btn
            label={translate('analysis', language)}
            onClick={() => handleTabClick("/dashboard")}
            className={activeTab === "/dashboard" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label={translate('profitAndlossPlanning', language)}
            onClick={() => handleTabClick("/planning")}
            className={activeTab === "/planning" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label={translate('results', language)}
            onClick={() => handleTabClick("/*")}
            className={activeTab === "/*" ? "h-btn-active header-btn" : "header-btn"}
          />
        </div>
        <div className="employeeExpensesRegistration_language-toggle">
          <p className="employeeExpensesRegistration_pl-label">English</p>
            <label className="employeeExpensesRegistration_switch">
              <input type="checkbox" checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle}/>
              <span className="employeeExpensesRegistration_slider"></span>
            </label>
        </div>
      </div>
     </div>
     <div className="employeeExpensesRegistration_cont_wrapper">
         <div className="employeeExpensesRegistration_sidebar">
             <Sidebar />
         </div>
         <div className="employeeExpensesRegistration_wrapper_div">
                 <div className="employeeExpensesRegistration_top_content">
                     <div className="employeeExpensesRegistration_top_body_cont">
                         <div className="employeeExpensesRegistration_top_btn_cont"></div>
                     </div>
                     <div className="employeeExpensesRegistration_mid_body_cont">
                         <div className="employeeExpensesRegistration_mid_btn_cont">
                                {[...Array(4)].map((_, index) => (
                                  <Btn
                                    key={index}
                                    label={translate(index === 0 ? 'project' : index === 1 ? 'employeeExpenses' : index === 2 ? 'expenses' : 'costOfSales', language)}
                                    onClick={() =>
                                      handleTabsClick(
                                        index === 0
                                          ? 'project'
                                          : index === 1
                                            ? 'employeeExpenses'
                                            : index === 2
                                              ? 'expenses': 'costOfSales'
                                      )
                                    }
                                    className={
                                      activeTabOther ===
                                      (index === 0
                                        ? 'project'
                                        : index === 1
                                          ? 'employeeExpenses'
                                          : index === 2
                                            ? 'expenses': 'costOfSales')
                                        ? 'body-btn-active body-btn'
                                        : 'body-btn'
                                    }
                                  />
                                ))}
                         </div>
                         <div className="employeeExpensesRegistration_title_table_cont">
                             <p className="employeeExpensesRegistration_title">{translate('employeeExpensesRegistration', language)}</p>
                         </div>
                         <div className="employeeExpensesRegistration_table_wrapper">
                          <form onSubmit={handleSubmit} className="employeeExpensesRegistration_form_wrapper">
                              {containers.map((container, containerIndex) => (
                                <div className="employeeExpensesRegistration_container" key={containerIndex}>
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
                                          value={container.employeeName}
                                          onChange={(e) => handleInputChange(containerIndex, null, e)}
                                        >
                                          <option value="">{translate('selectEmployee', language)}</option>
                                          {personnel.map((person, index) => (
                                            <option key={index} value={person.username}>
                                              {person.username}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                    <div className="employeeExpensesRegistration_project-fields">
                                      {container.projects.map((project, projectIndex) => (
                                        <div className="employeeExpensesRegistration_project-group" key={projectIndex}>
                                          <div className="employeeExpensesRegistration_row">
                                            <div className="employeeExpensesRegistration_label">
                                              <p>{translate('project', language)}</p>
                                            </div>
                                            <div className="employeeExpensesRegistration_card-box">
                                              <select
                                                name="projectName"
                                                value={project.projectName}
                                                onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                                              >
                                                <option value=""></option>
                                                {personnelPlanning.map((person_plan, index) => (
                                                  <option key={index} value={person_plan.planning_project_name}>
                                                    {person_plan.planning_project_name}
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
                                                value={''}
                                                onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                                              >
                                                <option value=""></option>
                                                  {months.map((month, idx) => (
                                                    <option key={idx} value={month}>{language === "en" ? monthNames[month].en : monthNames[month].jp}</option>
                                                  ))}
                                              </select>
                                            </div>
                                          </div>
                                          <div className="employeeExpensesRegistration_row">
                                            <div className="employeeExpensesRegistration_label">
                                              <p>{translate('employeeExpenses', language)}</p>
                                            </div>
                                            <div className="employeeExpensesRegistration_card-box">
                                              <input
                                                type="number"
                                                name="unit_price"
                                                value={project.unit_price}
                                                onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                                              />
                                            </div>
                                          </div>
                                          <div className="employeeExpensesRegistration_row">
                                            <div className="employeeExpensesRegistration_label">
                                              <p>{translate('assignmentRatio', language)}</p>
                                            </div>
                                            <div className="employeeExpensesRegistration_card-box">
                                              <input
                                                type="number"
                                                name="ratio"
                                                value={project.ratio}
                                                onChange={(e) => handleInputChange(containerIndex, projectIndex, e)}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                      <div className="employeeExpensesRegistration_button-box">
                                        {container.projects.length < 5 && (
                                          <Btn
                                            label={translate('add', language)}
                                            className="employeeExpensesRegistration_button"
                                            type="button"
                                            onClick={() => handleAddProject(containerIndex)}
                                          />
                                        )}
                                    </div>
                                    </div>
                                  </div>

                                </div>
                              ))}
                              <div className="employeeExpensesRegistration_cont-footer">
                                <div className="employeeExpensesRegistration_btn-plusminus">
                                  <Btn label="+" className="employeeExpensesRegistration_plus-btn" type="button" onClick={handleAddContainer} />
                                  <Btn label="-" className="employeeExpensesRegistration_minus-btn" type="button" onClick={handleRemoveContainer} />
                                </div>
                                <div className="employeeExpensesRegistration_btn-subcancel">
                                  <Btn label={translate('cancel', language)} className="employeeExpensesRegistration_cancel-btn is-light" type="button" onClick={() => alert('cancel')} />
                                  <Btn label={translate('submit', language)} className="employeeExpensesRegistration_submit-btn is-info" type="submit" onClick={() => ''} />
                                </div>
                                {/* <button className="save-btn" type='submit'>Save</button> */}
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
