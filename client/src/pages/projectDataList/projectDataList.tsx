import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import Pagination from "../../components/Pagination/Pagination";
import axios from "axios";
import { HeaderDashboard } from "../../components/header/header";
import Sidebar from "../../components/SideBar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";


const ProjectDataList: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('case')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const select = [5, 10, 100]

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

    const [projects, setProjects] = useState([]);


    const handleRowsPerPageChange = (numRows: number) => {
        setRowsPerPage(numRows)
        setCurrentPage(0) 
    }


    useEffect(() => {
        const fetchProjects = async () => {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            window.location.href = '/login';  // Redirect to login if no token found
            return;
          }
    
          try {
            // const response = await axios.get('http://127.0.0.1:8000/api/planningprojects/', {
            const response = await axios.get('http://54.178.202.58:8000/api/planningprojects/', {
              headers: {
                'Authorization': `Bearer ${token}`  // Add token to request headers
              }
            });
            setProjects(response.data);
          } catch (error) {
            if (error.response && error.response.status === 401) {
              window.location.href = '/login';  // Redirect to login if unauthorized
            } else {
              console.error('There was an error fetching the projects!', error);
            }
          }
        };
    
        fetchProjects();
      }, []);

      useEffect(() => {
        const startIndex = currentPage * rowsPerPage
        setPaginatedData(projects.slice(startIndex, startIndex + rowsPerPage))
      }, [currentPage, rowsPerPage, projects])

      useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning' || path === '/result') {
          setActiveTab(path);
        }
      }, [location.pathname]);

  return (
    <div className='proj_wrapper'>
       <div className="header_cont">
        <div className="proj_top_btn_cont">
            <Btn
                label="分析"
                onClick={() => handleTabClick("/dashboard")}
                className={activeTab === "/dashboard" ? "h-btn-active header-btn" : "header-btn"}
            />
            <Btn
                label="計画"
                onClick={() => handleTabClick("/planning")}
                className={activeTab === "/planning" ? "h-btn-active header-btn" : "header-btn"}
            />
            <Btn
                label="実績"
                onClick={() => handleTabClick("/result")}
                className={activeTab === "/result" ? "h-btn-active header-btn" : "header-btn"}
            />
        </div>
        </div>
        <div className="projectlist_cont_wrapper">
            <div className="sidebar">
                <Sidebar />
            </div>
            <div className="projectlist_wrapper">
                    <div className="proj_top_content">
                        <div className="proj_top_body_cont">
                          
                        </div>
                        <div className="proj_mid_body_cont">
                            <div className="proj_mid_btn_cont">
                              {[...Array(4)].map((_, index) => (
                                  <Btn
                                    key={index}
                                    label={
                                      index === 0
                                        ? '案件'
                                        : index === 1
                                          ? '人件費'
                                          : index === 2
                                            ? '經費': '売上原価'
                                    }
                                    onClick={() =>
                                      handleTabsClick(
                                        index === 0
                                          ? 'case'
                                          : index === 1
                                            ? 'personnel_cost'
                                            : index === 2
                                              ? 'expenses': 'cost_purchase'
                                      )
                                    }
                                    className={
                                      activeTabOther ===
                                      (index === 0
                                        ? 'case'
                                        : index === 1
                                          ? 'personnel_cost'
                                          : index === 2
                                            ? 'expenses': 'cost_purchase')
                                        ? 'body-btn-active body-btn'
                                        : 'body-btn'
                                    }
                                  />
                                ))}
                            </div>
                            <div className="proj_title_table_cont">
                                <p className="proj_title">案件一覧</p>
                                <Btn 
                                    label="新規登録"
                                    size="normal"
                                    onClick={() =>("")}
                                    className="proj_btn"
                                />
                            </div>
                            <div className="proj_table_wrapper">
                                <div className="proj_table_cont">
                                    <div className='columns is-mobile'>
                                        <div className='column'>
                                            <table className='table is-bordered is-hoverable'>
                                            <thead>
                                                <tr className="proj_table_title ">
                                                <th className="proj_table_title_content_vertical has-text-centered">顧客</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">案件名</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">受注事業部</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">月</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">営業外収益</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">営業外費用</th>
                                                </tr>
                                            </thead>
                                            <tbody className="proj_table_body">
                                                {projects.map((project) => (
                                                    <tr key={project.planning_project_id} className="proj_table_body_content_horizantal">
                                                    <td className="proj_table_body_content_vertical has-text-centered">{project.client.client_name}</td>
                                                    <td className="proj_table_body_content_vertical">{project.planning_project_name}</td>
                                                    <td className="proj_table_body_content_vertical has-text-centered">{project.year}/{project.month}</td>
                                                    <td className="proj_table_body_content_vertical has-text-right">{project.sales_revenue}</td>
                                                    <td className="proj_table_body_content_vertical has-text-right">{project.operating_profit}</td>
                                                    <td className="proj_table_body_content_vertical has-text-right">{project.operating_profit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="proj_pagination_wrapper">
                                  <div className="proj_pagination_cont">
                                      <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        options={select}
                                        rowsPerPage={rowsPerPage}
                                        onRowsPerPageChange={handleRowsPerPageChange}
                                      />
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
