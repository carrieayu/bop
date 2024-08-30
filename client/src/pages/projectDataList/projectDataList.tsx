import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import Pagination from "../../components/Pagination/Pagination";
import axios from "axios";
import { HeaderDashboard } from "../../components/header/header";
import Sidebar from "../../components/SideBar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";


const ProjectDataList: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('case')
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
      setIsEditing((prevState) => !prevState)
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
        const newLanguage = isTranslateSwitchActive ? 'jp' : 'en';
        setLanguage(newLanguage);
      };

  return (
    <div className='proj_wrapper'>
      <div className='header_cont'>
        <div className='proj_top_btn_cont'>
          <div className='header-buttons'>
            <Btn
              label={translate('analyze', language)}
              onClick={() => handleTabClick('/dashboard')}
              className={activeTab === '/dashboard' ? 'h-btn-active header-btn' : 'header-btn'}
            />
            <Btn
              label={translate('plan', language)}
              onClick={() => handleTabClick('/planning')}
              className={activeTab === '/planning' ? 'h-btn-active header-btn' : 'header-btn'}
            />
            <Btn
              label={translate('results', language)}
              onClick={() => handleTabClick('/*')}
              className={activeTab === '/*' ? 'h-btn-active header-btn' : 'header-btn'}
            />
          </div>
          <div className='language-toggle'>
            <p className='pl-label'>English</p>
            <label className='switch'>
              <input type='checkbox' checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle} />
              <span className='slider'></span>
            </label>
          </div>
        </div>
      </div>
      <div className='projectlist_cont_wrapper'>
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className='projectlist_wrapper'>
          <div className='proj_top_content'>
            <div className='proj_top_body_cont'>
              <div className='mode_switch_datalist'>
                <button className='mode_switch' onClick={handleClick}>
                  {isEditing ? '表示モード切り替え' : '編集モード切替'}
                </button>
              </div>
            </div>
            <div className='proj_mid_body_cont'>
              <div className='proj_mid_btn_cont'>
                {[...Array(4)].map((_, index) => (
                  <Btn
                    key={index}
                    label={translate(
                      index === 0
                        ? 'project'
                        : index === 1
                          ? 'personnelExpenses'
                          : index === 2
                            ? 'budget'
                            : 'costOfgoodSold',
                      language,
                    )}
                    onClick={() =>
                      handleTabsClick(
                        index === 0
                          ? 'case'
                          : index === 1
                            ? 'personnel_cost'
                            : index === 2
                              ? 'expenses'
                              : 'cost_purchase',
                      )
                    }
                    className={
                      activeTabOther ===
                      (index === 0
                        ? 'case'
                        : index === 1
                          ? 'personnel_cost'
                          : index === 2
                            ? 'expenses'
                            : 'cost_purchase')
                        ? 'body-btn-active body-btn'
                        : 'body-btn'
                    }
                  />
                ))}
              </div>
              <div className='proj_title_table_cont'>
                <p className='proj_title'>{translate('projectList', language)}</p>
                <Btn
                  label={translate('newRegistration', language)}
                  size='normal'
                  onClick={() => ''}
                  className='proj_btn'
                />
              </div>
              <div className='proj_table_wrapper'>
                <div className='proj_table_cont'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      {isEditing ? (
                        <div>
                          <table className='table is-bordered is-hoverable'>
                            <thead>
                              <tr className='proj_table_title '>
                                <th className='proj_table_title_content_vertical has-text-centered'>
                                  {translate('customer', language)}
                                </th>
                                <th className='proj_table_title_content_vertical has-text-centered'>
                                  {translate('projectName', language)}
                                </th>
                                {/* <th className="proj_table_title_content_vertical has-text-centered">受注事業部</th> */}
                                <th className='proj_table_title_content_vertical has-text-centered'>
                                  {translate('month', language)}
                                </th>
                                <th className='proj_table_title_content_vertical has-text-centered'>
                                  {translate('salesRevenue', language)}
                                </th>
                                <th className='proj_table_title_content_vertical has-text-centered'>
                                  {translate('nonOperationalRevenue', language)}
                                </th>
                                <th className='proj_table_title_content_vertical has-text-centered'>
                                  {translate('noneOperationalExpenses', language)}
                                </th>
                              </tr>
                            </thead>
                            <tbody className='proj_table_body'>
                              {projects.map((project, index) => (
                                <tr key={project.planning_project_id} className='proj_table_body_content_horizantal'>
                                  <td className='proj_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='client.client_name'
                                      value={project.client.client_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='proj_table_body_content_vertical'>
                                    <input
                                      type='text'
                                      name='planning_project_name'
                                      value={project.planning_project_name}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='proj_table_body_content_vertical'>
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
                                  <td className='proj_table_body_content_vertical'>
                                    <input
                                      type='number'
                                      name='sales_revenue'
                                      value={project.sales_revenue}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='proj_table_body_content_vertical'>
                                    <input
                                      type='number'
                                      name='non_operating_income'
                                      value={project.non_operating_income}
                                      onChange={(e) => handleChange(index, e)}
                                    />
                                  </td>
                                  <td className='proj_table_body_content_vertical'>
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
                            <tr className='proj_table_title '>
                              <th className='proj_table_title_content_vertical has-text-centered'>
                                {translate('customer', language)}
                              </th>
                              <th className='proj_table_title_content_vertical has-text-centered'>
                                {translate('projectName', language)}
                              </th>
                              {/* <th className="proj_table_title_content_vertical has-text-centered">受注事業部</th> */}
                              <th className='proj_table_title_content_vertical has-text-centered'>
                                {translate('month', language)}
                              </th>
                              <th className='proj_table_title_content_vertical has-text-centered'>
                                {translate('salesRevenue', language)}
                              </th>
                              <th className='proj_table_title_content_vertical has-text-centered'>
                                {translate('nonOperationalRevenue', language)}
                              </th>
                              <th className='proj_table_title_content_vertical has-text-centered'>
                                {translate('noneOperationalExpenses', language)}
                              </th>
                            </tr>
                          </thead>
                          <tbody className='proj_table_body'>
                            {projects.map((project) => (
                              <tr key={project.planning_project_id} className='proj_table_body_content_horizantal'>
                                <td className='proj_table_body_content_vertical'>{project.client.client_name}</td>
                                <td className='proj_table_body_content_vertical'>{project.planning_project_name}</td>
                                <td className='proj_table_body_content_vertical'>
                                  {project.year}/{project.month}
                                </td>
                                <td className='proj_table_body_content_vertical'>{project.sales_revenue}</td>
                                <td className='proj_table_body_content_vertical'>{project.non_operating_income}</td>
                                <td className='proj_table_body_content_vertical'>{project.non_operating_expenses}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className='proj_pagination_wrapper'>
                <div className='proj_pagination_cont'>
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
                        更新する
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

export default ProjectDataList;
