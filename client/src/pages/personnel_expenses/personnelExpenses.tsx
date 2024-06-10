import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import Pagination from '../../components/Pagination/Pagination'
import { HeaderDashboard } from '../../components/Header/header'
import { UnknownAction } from 'redux'
import { useAppSelector } from '../../actions/hooks'
import { RootState } from '../../app/store'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { fetchPersonnel } from '../../reducers/personnel/personnelExpensesSlice'

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
      <div className='proj_wrapper'>
        <div className='proj_whole_container'>
          <div className='proj_header_wrapper'>
            <div className='proj_header_cont'>
              <HeaderDashboard value='value' />
            </div>
          </div>
          <div className='proj_top_wrapper'>
            <div className='proj_top_cont'>
              {headerButtons.map((button) => (
                <Btn
                  key={button.index}
                  label={button.label}
                  size='normal'
                  onClick={() => handleButton1Click(button.index)}
                  className={`proj_btn ${activeButton1 === button.index ? 'active' : ''}`}
                />
              ))}
            </div>
          </div>
          <div className='proj_body_wrapper'>
            <div className='proj_body_cont'>
              <div className='proj_topbody'>
                {topBodyButtons.map((button) => (
                  <Btn
                    key={button.index}
                    label={button.label}
                    size='normal'
                    onClick={() => handleButton2Click(button.index)}
                    className={`proj_btn ${activeButton2 === button.index ? 'active' : ''}`}
                  />
                ))}
              </div>
              <div className='proj_midbody'>
                <p className='proj_mid_txt'>案件一覧</p>
                <Btn label='新規登録' size='normal' onClick={() => ''} className='proj_btn' />
              </div>
              <div className='proj_botbody'>
                <div className='proj_table_container'>
                  <div className='columns is-mobile'>
                    <div className='column'>
                      <table className='table is-bordered is-hoverable'>
                        <thead>
                          <tr className='proj_table_title'>
                            <th className='proj_table_title_content_vertical has-text-centered'>顧客名</th>
                            <th className='proj_table_title_content_vertical has-text-centered'>案件</th>
                            <th className='proj_table_title_content_vertical has-text-centered'>案件</th>
                            <th className='proj_table_title_content_vertical has-text-centered'>案件</th>
                            <th className='proj_table_title_content_vertical has-text-centered'>案件</th>
                            <th className='proj_table_title_content_vertical has-text-centered'>案件</th>
                          </tr>
                        </thead>
                        <tbody className='proj_table_body'>
                          {personnel.map((user, index) => (
                            <tr key={index}>
                              <td>{user.username}</td>
                              {user.planning_assign?.map((assign, index) => (
                                <>
                                  <td>
                                    <div style={{ textAlign: 'center', border: '1px solid black' }}>
                                      {assign.planning_project['planning_project_name']}
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                      <div style={{ width: '100%' , textAlign: 'center' , border: '1px solid black' }}>人件費</div>
                                      <div style={{ width: '100%' , textAlign: 'center' , border: '1px solid black' }}>{assign.planning_project['personal_expenses']}</div>
                                      <div style={{ width: '100%' , textAlign: 'center' , border: '1px solid black' }}>割合</div>
                                      <div style={{ width: '100%' , textAlign: 'center' , border: '1px solid black' }}>{assign.assignment_ratio}</div>
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
              <div className='proj_footer_wrapper'>
                <div className='proj_footer_cont'>
                  {/* <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}

export default PersonnelExpensesList

