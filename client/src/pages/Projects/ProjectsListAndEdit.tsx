import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import axios from "axios";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";


const ProjectsListAndEdit: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('project')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const select = [5, 10, 100]
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translations
    const [isEditing, setIsEditing] = useState(false)
    const [changes, setChanges] = useState({})
    const [projects, setProjects] = useState([])
    const months = ['4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3']
    const [initialLanguage, setInitialLanguage] = useState(language);

    const totalPages = Math.ceil(100 / 10);

    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
      }
      
      const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
      }
    
    const handlePageChange = (page: number) => {
      setCurrentPage(page);
    };

    const handleRowsPerPageChange = (numRows: number) => {
        setRowsPerPage(numRows)
        setCurrentPage(0) 
    }

    const handleClick = () => {
      setIsEditing((prevState) => {
        const newEditingState = !prevState;
        if (newEditingState) {
          setLanguage(initialLanguage);
        }
    
        return newEditingState;
      });
    }


    const handleChange = (index, event) => {
      const { name, value } = event.target
      const updatedProjects = [...projects]
      if (name.includes('client.client_name')) {
        updatedProjects[index].client.client_name = value
      } else {
        updatedProjects[index][name] = value
      }
      setProjects(updatedProjects)
      const projectId = updatedProjects[index].planning_project_id
      setChanges((prevChanges) => ({
        ...prevChanges,
        [projectId]: {
          ...prevChanges[projectId],
          [name]: value,
        },
      }))
    }

    const handleSubmit = async (e) => {
      event.preventDefault()
      console.log('Changed Data:', changes)

      const token = localStorage.getItem('accessToken')
      if (!token) {
        window.location.href = '/login'
        return
      }

      try {
        // const response = await axios.put('http://127.0.0.1:8000/api/projectdatalist/update/', changes, {
        const response = await axios.put('http://54.178.202.58:8000/api/projectdatalist/update/',  changes ,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        alert('Sucessfully updated')
      } catch (error) {
        if (error.response && error.response.status === 401) {
          window.location.href = '/login'
        } else {
          console.error('There was an error updating the project planning data!', error)
        }
      }

    }

    useEffect(() => {
      const fetchProjects = async () => {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          window.location.href = '/login' // Redirect to login if no token found
          return
        }

        try {
          // const response = await axios.get('http://127.0.0.1:8000/api/planningprojects/', {
          const response = await axios.get('http://54.178.202.58:8000/api/planningprojects/', {
            headers: {
              Authorization: `Bearer ${token}`, // Add token to request headers
            },
          })
          setProjects(response.data)
        } catch (error) {
          if (error.response && error.response.status === 401) {
            window.location.href = '/login' // Redirect to login if unauthorized
          } else {
            console.error('There was an error fetching the projects!', error)
          }
        }
      }

      fetchProjects()
    }, [])

      useEffect(() => {
        const startIndex = currentPage * rowsPerPage
        setPaginatedData(projects.slice(startIndex, startIndex + rowsPerPage))
      }, [currentPage, rowsPerPage, projects])

      useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning' || path === '/*') {
          setActiveTab(path);
        }
      }, [location.pathname]);

      useEffect(() => {
        setIsTranslateSwitchActive(language === 'en');
      }, [language]);
    
      const handleTranslationSwitchToggle = () => {
        if (!isEditing) {
          const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
          setInitialLanguage(language); 
          setLanguage(newLanguage);
        }
      };

      const handleNewRegistrationClick = () => {
        navigate('/projectcreate');
      };

  return (
    <div className='projectsList_wrapper'>
      <div className='projectsList_header_cont'>
        <div className='projectsList_top_btn_cont'>
          <div className='projectsList_header-buttons'>
            <Btn
              label={translate('analysis', language)}
              onClick={() => handleTabClick('/dashboard')}
              className={activeTab === '/dashboard' ? 'h-btn-active header-btn' : 'header-btn'}
            />
            <Btn
              label={translate('profitAndlossPlanning', language)}
              onClick={() => handleTabClick('/planning')}
              className={activeTab === '/planning' ? 'h-btn-active header-btn' : 'header-btn'}
            />
            <Btn
              label={translate('results', language)}
              onClick={() => handleTabClick('/*')}
              className={activeTab === '/*' ? 'h-btn-active header-btn' : 'header-btn'}
            />
          </div>
          <div className='projectsList_language-toggle'>
            <p className='projectsList_pl-label'>English</p>
            <label className='projectsList_switch'>
              <input type='checkbox' checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle} disabled={isEditing}/>
              <span className='projectsList_slider'></span>
            </label>
          </div>
        </div>
      </div>
      <div className='projectsList_cont_wrapper'>
        <div className='projectsList_sidebar'>
          <Sidebar />
        </div>
        <div className='projectsList_wrapper'>
          <div className='projectsList_top_content'>
            <div className='projectsList_top_body_cont'>
              <div className='projectsList_mode_switch_datalist'>
                <button className='projectsList_mode_switch' onClick={handleClick}>
                  {isEditing ? translate('switchToDisplayMode', language) : translate('switchToEditMode', language)}
                </button>
              </div>
            </div>
            <div className='projectsList_mid_body_cont'>
              <div className='projectsList_mid_btn_cont'>
                {[...Array(4)].map((_, index) => (
                  <Btn
                    key={index}
                    label={translate(
                      index === 0
                        ? 'project'
                        : index === 1
                          ? 'employeeExpenses'
                          : index === 2
                            ? 'expenses'
                            : 'costOfSales',
                      language,
                    )}
                    onClick={() =>
                      handleTabsClick(
                        index === 0
                          ? 'project'
                          : index === 1
                            ? 'employeeExpenses'
                            : index === 2
                              ? 'expenses'
                              : 'costOfSales',
                      )
                    }
                    className={
                      activeTabOther ===
                      (index === 0
                        ? 'project'
                        : index === 1
                          ? 'employeeExpenses'
                          : index === 2
                            ? 'expenses'
                            : 'costOfSales')
                        ? 'body-btn-active body-btn'
                        : 'body-btn'
                    }
                  />
                ))}
              </div>
              <div className='projectsList_title_table_cont'>
                <p className='projectsList_title'>{translate('projectsList', language)}</p>
                <Btn
                  label={translate('newRegistration', language)}
                  size='normal'
                  onClick={handleNewRegistrationClick}
                  className='projectsList_btn'
                />
              </div>
              <div className='projectsList_table_wrapper'>
                <div className='projectsList_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='projectsList_table_title '>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('client', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('projectName', language)}
                                </th>
                                {/* <th className="projectsList_table_title_content_vertical has-text-centered">受注事業部</th> */}
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('month', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('salesRevenue', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('nonOperatingIncome', language)}
                                </th>
                                <th className='projectsList_table_title_content_vertical has-text-centered'>
                                  {translate('nonOperatingExpenses', language)}
                                </th>
                              </tr>
                            </thead>
                            <tbody className='projectsList_table_body'>
                              {projects.map((project, index) => (
                                <tr key={project.planning_project_id} className='projectsList_table_body_content_horizantal'>
                                  <td className='projectsList_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='client.client_name'
                                      value={project.client.client_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='planning_project_name'
                                      value={project.planning_project_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    <select
                                      className='select-option'
                                      name='month'
                                      value={project.month}
                                      onChange={(e) => handleChange(index, e)}
                                    >
                                      <option value=''></option>
                                      {months.map((month, idx) => (
                                        <option key={idx} value={month}>
                                          {month}月
                                        </option>
                                      ))}
                                    </select>
                                    {}
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    <input
                                      type='number'
                                      name='sales_revenue'
                                      value={project.sales_revenue}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    <input
                                      type='number'
                                      name='non_operating_income'
                                      value={project.non_operating_income}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='projectsList_table_body_content_vertical'>
                                    <input
                                      type='number'
                                      name='non_operating_expenses'
                                      value={project.non_operating_expenses}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <table className='table is-bordered is-hoverable'>
                          <thead>
                            <tr className='projectsList_table_title '>
                              <th className='projectsList_table_title_content_vertical has-text-centered'>
                                {translate('client', language)}
                              </th>
                              <th className='projectsList_table_title_content_vertical has-text-centered'>
                                {translate('projectName', language)}
                              </th>
                              {/* <th className="projectsList_table_title_content_vertical has-text-centered">受注事業部</th> */}
                              <th className='projectsList_table_title_content_vertical has-text-centered'>
                                {translate('month', language)}
                              </th>
                              <th className='projectsList_table_title_content_vertical has-text-centered'>
                                {translate('salesRevenue', language)}
                              </th>
                              <th className='projectsList_table_title_content_vertical has-text-centered'>
                                {translate('nonOperatingIncome', language)}
                              </th>
                              <th className='projectsList_table_title_content_vertical has-text-centered'>
                                {translate('nonOperatingExpenses', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='projectsList_table_body'>
                            {projects.map((project) => (
                              <tr key={project.planning_project_id} className='projectsList_table_body_content_horizantal'>
                                <td className='projectsList_table_body_content_vertical'>{project.client.client_name}</td>
                                <td className='projectsList_table_body_content_vertical'>{project.planning_project_name}</td>
                                <td className='projectsList_table_body_content_vertical'>
                                  {project.year}/{project.month}
                                </td>
                                <td className='projectsList_table_body_content_vertical'>{project.sales_revenue}</td>
                                <td className='projectsList_table_body_content_vertical'>{project.non_operating_income}</td>
                                <td className='projectsList_table_body_content_vertical'>{project.non_operating_expenses}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='projectsList_pagination_wrapper'>
                <div className='projectsList_pagination_cont'>
                  {/* <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    options={select}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                  /> */}
                  {isEditing ? (
                    <div className='mode_switch_datalist'>
                      <button className='edit_submit_btn' onClick={handleSubmit}>
                          更新
                      </button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default ProjectsListAndEdit;
