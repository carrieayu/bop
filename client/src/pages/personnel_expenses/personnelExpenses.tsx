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

interface ButtonData {
  label: string
  index: number
}

const PersonnelExpensesList: React.FC = () => {
    const personnel = useAppSelector((state: RootState) => state.personnel.personnelList)
    const dispatch = useDispatch()
    const [activeButton1, setActiveButton1] = useState(1)
    const [activeButton2, setActiveButton2] = useState(0)

    const headerButtons: ButtonData[] = [
        { label: "分析", index: 0 },
        { label: "計画", index: 1 },
        { label: "実績", index: 2 },
    ];

    const topBodyButtons: ButtonData[] = [
        { label: "案件", index: 0 },
        { label: "人件費", index: 1 },
        { label: "経費", index: 2 },
        { label: "原価 - 仕入", index: 3 },
        { label: "原価 - 外注費", index: 4 },
        { label: "原価 - 通信費", index: 5 },
    ];

    const handleButton1Click = (index) => {
        setActiveButton1(index)
    }
    const handleButton2Click = (index) => {
        setActiveButton2(index)
    }
  

    useEffect(() => {
      dispatch(fetchPersonnel() as unknown as UnknownAction)
    }, [dispatch])

    console.log("data: ", personnel)

    return (
      <div className='personnel_wrapper'>
      <div className="header_cont">
        <div className="personnel_top_btn_cont">
            {headerButtons.map((button) => (
                <Btn 
                    key={button.index}
                    label={button.label}
                    size="normal"
                    onClick={() => handleButton1Click(button.index)}
                    className={`personnel_btn ${activeButton1 === button.index ? 'active' : ''}`}
                />
            ))}
        </div>
       </div>
       <div className="personnel_cont_wrapper">
           <div className="sidebar">
               <Sidebar />
           </div>
           <div className="personnel_wrapper_div">
                   <div className="personnel_top_content">
                       <div className="personnel_top_body_cont">
                           <div className="personnel_top_btn_cont">
                             
                           </div>
                       </div>
                       <div className="personnel_mid_body_cont">
                           <div className="personnel_mid_btn_cont">
                               {topBodyButtons.map((button) => (
                                   <Btn 
                                       key={button.index}
                                       label={button.label}
                                       size="normal"
                                       onClick={() => handleButton2Click(button.index)}
                                       className={`personnel_btn ${activeButton2 === button.index ? 'active' : ''}`}
                                   />
                               ))}
                           </div>
                           <div className="personnel_title_table_cont">
                               <p className="personnel_title">人件費一覧</p>
                               <Btn 
                                   label="新規登録"
                                   size="normal"
                                   onClick={() =>("")}
                                   className="personnel_btn"
                               />
                           </div>
                           <div className="personnel_table_wrapper">
                               <div className="personnel_table_cont">
                                   <div className='columns is-mobile'>
                                       <div className='column'>
                                           <table className='table is-bordered is-hoverable'>
                                           <thead>
                                            <tr className='personnel_table_title'>
                                              <th className='personnel_table_title_content_vertical has-text-centered'>顧客名</th>
                                              <th className='personnel_table_title_content_vertical has-text-centered'>案件</th>
                                              <th className='personnel_table_title_content_vertical has-text-centered'>案件</th>
                                              <th className='personnel_table_title_content_vertical has-text-centered'>案件</th>
                                              <th className='personnel_table_title_content_vertical has-text-centered'>案件</th>
                                              <th className='personnel_table_title_content_vertical has-text-centered'>案件</th>
                                            </tr>
                                           </thead>
                                           <tbody className="personnel_table_body">
                                              {personnel.map((user, index) => (
                                                  <tr key={index} className="user_name">
                                                    <td>{user.username}</td>
                                                    {user.planning_assign?.map((assign, index) => (
                                                      <>
                                                        <td>
                                                          <div style={{ textAlign: 'center'}} className="txt0">
                                                            {assign.planning_project['planning_project_name']}
                                                          </div>
                                                          <div style={{ display: 'flex' }}>
                                                            <div style={{ width: '100%' , textAlign: 'center' }} className="txt1">人件費</div>
                                                            <div style={{ width: '100%' , textAlign: 'center' }} className="txt2">{assign.planning_project['personal_expenses']}</div>
                                                            <div style={{ width: '100%' , textAlign: 'center' }} className="txt3">割合</div>
                                                            <div style={{ width: '100%' , textAlign: 'center' }} className="txt4">{assign.assignment_ratio}</div>
                                                          </div>
                                                        </td>
                                                      </>
                                                    ))}
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

