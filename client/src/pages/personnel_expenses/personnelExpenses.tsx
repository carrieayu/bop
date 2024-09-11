import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import Pagination from '../../components/Pagination/Pagination'
import { UnknownAction } from 'redux'
import { useAppSelector } from '../../actions/hooks'
import { RootState } from '../../app/store'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { fetchPersonnel } from '../../reducers/personnel/personnelExpensesSlice'
import Sidebar from '../../components/SideBar/Sidebar'
import { HeaderDashboard } from '../../components/header/header'
import { useLocation, useNavigate } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { translate } from '../../utils/translationUtil'

const months: string[] = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];


const PersonnelExpensesList: React.FC = () => {
    const personnel = useAppSelector((state: RootState) => state.personnel.personnelList)
    const itemsPerRow = 4
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('project')
    const { language, setLanguage } = useLanguage()
    const [isTranslateSwitchActive, setIsTranslateSwitchActive] = useState(language === 'en'); // State for switch in translations


    const handleTabClick = (tab) => {
        setActiveTab(tab)
        navigate(tab)
      }

      const handleTabsClick = (tab) => {
        setActiveTabOther(tab)
      }
  

    useEffect(() => {
      dispatch(fetchPersonnel() as unknown as UnknownAction)
    }, [dispatch])
    
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
      <div className='employeeExpensesList_wrapper'>
        <div className='employeeExpensesList_header_cont'>
          <div className='employeeExpensesList_top_btn_cont'>
          <div className="employeeExpensesList_header-buttons">
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
        <div className="employeeExpensesList_language-toggle">
          <p className="employeeExpensesList_pl-label">English</p>
            <label className="employeeExpensesList_switch">
              <input type="checkbox" checked={isTranslateSwitchActive} onChange={handleTranslationSwitchToggle}/>
              <span className="employeeExpensesList_slider"></span>
            </label>
        </div>
          </div>
        </div>
        <div className='employeeExpensesList_cont_wrapper'>
          <div className='employeeExpensesList_sidebar'>
            <Sidebar />
          </div>
          <div className='employeeExpensesList_wrapper_div'>
            <div className='employeeExpensesList_top_content'>
              <div className='employeeExpensesList_top_body_cont'>
                <div className='employeeExpensesList_top_btn_cont'></div>
              </div>
              <div className='employeeExpensesList_mid_body_cont'>
                <div className='employeeExpensesList_mid_btn_cont'>
                  {[...Array(4)].map((_, index) => (
                    <Btn
                      key={index}
                      label={translate(index === 0 ? 'project' : index === 1 ? 'employeeExpenses' : index === 2 ? 'expenses' : 'costOfSales', language)}
                      onClick={() =>
                        handleTabsClick(
                          index === 0
                            ? 'project'
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
                          ? 'project'
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
                <div className='employeeExpensesList_title_table_cont'>
                  <p className='employeeExpensesList_title'>{translate('employeeExpensesList', language)}</p>
                  <Btn label={translate('newRegistration', language)} size='normal' onClick={() => ''} className='employeeExpensesList_btn' />
                </div>
                <div className='employeeExpensesList_table_wrapper'>
                  <div className='employeeExpensesList_table_cont'>
                    <div className='columns is-mobile'>
                      <div className='column'>
                        <table className='table is-bordered is-hoverable'>
                          <thead>
                            <tr className='employeeExpensesList_table_title'>
                              <th className='employeeExpensesList_table_title_content_vertical has-text-centered'></th>
                              {months.map((month, index) => (
                                <th key={index} className='employeeExpensesList_table_title_content_vertical has-text-centered'>
                                  {language === "en" ? monthNames[month].en : monthNames[month].jp}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className='employeeExpensesList_table_body'>
                            {personnel.map((user, userIndex) => {
                              return (
                                <tr className='employeeExpensesList_user_name'>
                                  {user.username}
                                  {user.planning_assign?.map((planning, planningIndex) => (
                                    <td>
                                      <div className='employeeExpensesList_txt0'>フィリピン事業支援業務</div>
                                      <div className='employeeExpensesList_txt1_txt2_flex'>
                                        <div className='employeeExpensesList_txt1'>{translate('employeeExpenses', language)}</div>
                                        <div className='employeeExpensesList_txt2'>{planning.planning_project['personal_expenses']}</div>
                                      </div>
                                      <div className='employeeExpensesList_txt3_txt4_flex'>
                                        <div className='employeeExpensesList_txt3'>{translate('assignmentRatio', language)}</div>
                                        <div className='employeeExpensesList_txt4'>{planning.assignment_ratio}%</div>
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='employeeExpensesList_pagination_wrapper'>
                  <div className='employeeExpensesList_pagination_cont'>
                    {/* <Pagination
                                     currentPage={currentPage}
                                     totalPages={totalPages}
                                     onPageChange={handlePageChange}
                                     options={select}
                                     rowsPerPage={rowsPerPage}
                                     onRowsPerPageChange={handleRowsPerPageChange}
                                   /> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default PersonnelExpensesList

