import React, { useEffect, useState } from "react";
import Btn from "../../components/Button/Button";
import Pagination from "../../components/Pagination/Pagination";
import axios from "axios";
import { HeaderDashboard } from "../../components/header/header";
import Sidebar from "../../components/SideBar/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../../contexts/LanguageContext";
import { translate } from "../../utils/translationUtil";


const CostOfSalesList: React.FC = () => {
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('case')
    const [currentPage, setCurrentPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5)
    const [paginatedData, setPaginatedData] = useState<any[]>([])
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translations
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


    const [costOfSales, setCostOfSales] = useState([]);


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
            // const response = await axios.get('http://127.0.0.1:8000/api/cost-of-sales/', {
            const response = await axios.get('http://54.178.202.58:8000/api/cost-of-sales/', {
              headers: {
                'Authorization': `Bearer ${token}`  // Add token to request headers
              }
            });
            setCostOfSales(response.data);
            console.log("cost of sales: ", response.data);
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

      console.log("cost of sales: ", setCostOfSales);

      useEffect(() => {
        const startIndex = currentPage * rowsPerPage
        setPaginatedData(costOfSales.slice(startIndex, startIndex + rowsPerPage))
      }, [currentPage, rowsPerPage, costOfSales])

      useEffect(() => {
        const path = location.pathname;
        if (path === '/dashboard' || path === '/planning' || path === '/*') {
          setActiveTab(path);
        }
      }, [location.pathname]);

      // Fixed months array
    const months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];

    // Combine static months with dynamic data
    const combinedData = months.map((month) => {
        const data = costOfSales.find(item => parseInt(item.month, 10) === month) || {
            cost_of_sales: 0,
            purchases: 0,
            outsourcing_costs: 0,
            product_purchases: 0,
            dispatch_labor_costs: 0,
            communication_costs: 0,
            work_in_progress: 0,
            amortization: 0
        };
        return {
            month,
            ...data
        };
    });
    console.log("Combined Data: ", combinedData)

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
    <div className='proj_wrapper'>
       <div className="header_cont">
        <div className="proj_top_btn_cont">
        <div className="header-buttons">
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
        <div className="language-toggle">
          <p className="pl-label">English</p>
            <label className="switch">
              <input type="checkbox" checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle}/>
              <span className="slider"></span>
            </label>
        </div>
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
                                    label={translate(index === 0 ? 'project' : index === 1 ? 'employeeExpenses' : index === 2 ? 'expenses' : 'costOfSales', language)}
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
                                <p className="proj_title">{translate('costOfsalesList', language)}</p>
                                <Btn 
                                    label={translate('newRegistration', language)}
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
                                                <th className="proj_table_title_content_vertical has-text-centered">{translate('month', language)}</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">{translate('costOfSales', language)}</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">{translate('purchases', language)}</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">{translate('outsourcingExpenses', language)}</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">{translate('productPurchases', language)}</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">{translate('dispatchLabourExpenses', language)}</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">{translate('communicationExpenses', language)}</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">{translate('workInProgressExpenses', language)}</th>
                                                <th className="proj_table_title_content_vertical has-text-centered">{translate('amortizationExpenses', language)}</th>
                                                </tr>
                                            </thead>
                                            <tbody className="proj_table_body">
                                            {combinedData.map((project, index) => (
                                                        <tr key={index} className="proj_table_body_content_horizantal">
                                                            <td className="proj_table_body_content_vertical has-text-centered">{project.month}</td>
                                                            <td className="proj_table_body_content_vertical has-text-centered">{project.cost_of_sales || 0}</td>
                                                            <td className="proj_table_body_content_vertical has-text-centered">{project.purchases || 0}</td>
                                                            <td className="proj_table_body_content_vertical has-text-centered">{project.outsourcing_costs || 0}</td>
                                                            <td className="proj_table_body_content_vertical has-text-centered">{project.product_purchases || 0}</td>
                                                            <td className="proj_table_body_content_vertical has-text-centered">{project.dispatch_labor_costs || 0}</td>
                                                            <td className="proj_table_body_content_vertical has-text-centered">{project.communication_costs || 0}</td>
                                                            <td className="proj_table_body_content_vertical has-text-centered">{project.work_in_progress || 0}</td>
                                                            <td className="proj_table_body_content_vertical has-text-centered">{project.amortization || 0}</td>
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

export default CostOfSalesList;
