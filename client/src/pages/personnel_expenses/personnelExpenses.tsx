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

const months: string[] = [
  '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月', '1月', '2月', '3月'
];


const PersonnelExpensesList: React.FC = () => {
    const personnel = useAppSelector((state: RootState) => state.personnel.personnelList)
    const itemsPerRow = 4
    const dispatch = useDispatch()
    const [activeTab, setActiveTab] = useState('/planning')
    const navigate = useNavigate()
    const location = useLocation()
    const [activeTabOther, setActiveTabOther] = useState('case')


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
      if (path === '/dashboard' || path === '/planning' || path === '/result') {
        setActiveTab(path);
      }
    }, [location.pathname]);

    console.log("data: ", personnel)

    return (
      <div className='personnel_wrapper'>
        <div className='header_cont'>
          <div className='personnel_top_btn_cont'>
            <Btn
              label='分析'
              onClick={() => handleTabClick('/dashboard')}
              className={activeTab === '/dashboard' ? 'h-btn-active header-btn' : 'header-btn'}
            />
            <Btn
              label='計画'
              onClick={() => handleTabClick('/planning')}
              className={activeTab === '/planning' ? 'h-btn-active header-btn' : 'header-btn'}
            />
            <Btn
              label='実績'
              onClick={() => handleTabClick('/result')}
              className={activeTab === '/result' ? 'h-btn-active header-btn' : 'header-btn'}
            />
          </div>
        </div>
        <div className='personnel_cont_wrapper'>
          <div className='sidebar'>
            <Sidebar />
          </div>
          <div className='personnel_wrapper_div'>
            <div className='personnel_top_content'>
              <div className='personnel_top_body_cont'>
                <div className='personnel_top_btn_cont'></div>
              </div>
              <div className='personnel_mid_body_cont'>
                <div className='personnel_mid_btn_cont'>
                  {[...Array(4)].map((_, index) => (
                    <Btn
                      key={index}
                      label={index === 0 ? '案件' : index === 1 ? '人件費' : index === 2 ? '經費' : '売上原価'}
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
                <div className='personnel_title_table_cont'>
                  <p className='personnel_title'>人件費一覧</p>
                  <Btn label='新規登録' size='normal' onClick={() => ''} className='personnel_btn' />
                </div>
                <div className='personnel_table_wrapper'>
                  <div className='personnel_table_cont'>
                    <div className='columns is-mobile'>
                      <div className='column'>
                        <table className='table is-bordered is-hoverable'>
                          <thead>
                            <tr className='personnel_table_title'>
                              <th className='personnel_table_title_content_vertical has-text-centered'></th>
                                {months.map((month, index) => (
                                  <th key={index} className='personnel_table_title_content_vertical has-text-centered'>{month}</th>
                                ))}
                            </tr>
                          </thead>
                          <tbody className='personnel_table_body'>
                                <tr className="user_name">
                                  Joshua Mendoza
                                  <td>
                                    <div className='txt0'>フィリピン事業支援業務</div>
                                    <div className="txt1_txt2_flex">
                                      <div className="txt1">人件費</div>
                                      <div className="txt2">2000</div>
                                    </div>
                                    <div className="txt3_txt4_flex">
                                      <div className="txt3">割合</div>
                                      <div className="txt4">100%</div>
                                    </div>
                                  </td>
                                </tr>
                          </tbody>
                        </table>
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

