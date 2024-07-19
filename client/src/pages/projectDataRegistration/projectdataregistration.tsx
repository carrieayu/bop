import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import { HeaderDashboard } from '../../components/header/header'
import Sidebar from '../../components/SideBar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'

const months = [
  '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const ProjectDataRegistration = () => {
  const [activeTab, setActiveTab] = useState('/planning')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('case')
  const storedUserID = localStorage.getItem('userID')
  const years = [];
  for (let year = 2000; year <= new Date().getFullYear(); year++) {
    years.push(year);
  }
  const [formData, setFormData] = useState([
    {
      client_name: '',
      business_division_name: '',
      project_name: '',
      month: '',
      sales_revenue: '',
      non_operating_income: '',
      non_operating_expenses: '',
      registered_user_id: storedUserID,
    },
  ])

  const handleAdd = () => {
    if (formData.length < 10) {
      const newFormData = [...formData]
      newFormData.push({
        client_name: '',
        business_division_name: '',
        project_name: '',
        month: '',
        sales_revenue: '',
        non_operating_income: '',
        non_operating_expenses: '',
        registered_user_id: storedUserID,
      })
      setFormData(newFormData)
      console.log('add:' + formData)
    } else {
      console.log('You can only add up to 10 forms.')
    }
  }

  const handleMinus = () => {
    if (formData.length > 1) {
      const newFormData = [...formData]
      newFormData.pop()
      setFormData(newFormData)
    }
  }
  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }
  const handleTabsClick = (tab) => {
    setActiveTabOther(tab)
  }

  const handleChange = (index, event) => {
    const { name, value } = event.target
    const newFormData = [...formData]
    newFormData[index] = {
      ...newFormData[index],
      [name]: value,
    }
    setFormData(newFormData)
  }

  useEffect(() => {
  }, [formData])

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning' || path === '/result') {
      setActiveTab(path);
    }
  }, [location.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log(formData)

    const postData = {
      client: {
        client_name: formData.map((c) => c.client_name),
        registered_user_id: formData.map((c) => c.registered_user_id),
      },
      business: {
        business_division_name: formData.map((c) => c.business_division_name),
        registered_user_id: formData.map((c) => c.registered_user_id),
        company_id: formData.map((c) => c.registered_user_id),
      },
      planning: {
        project_name: formData.map((c) => c.project_name),
        month: formData.map((c) => c.month),
        sales_revenue: formData.map((c) => c.sales_revenue),
        non_operating_income: formData.map((c) => c.non_operating_income),
        non_operating_expenses: formData.map((c) => c.non_operating_expenses),
      },
      registered_user_id: formData.map((c) => c.registered_user_id),
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      // const response = await axios.post('http://127.0.0.1:8000/api/projectplanning/create/', postData, {
        const response = await axios.post('http://54.178.202.58:8000/api/projectplanning/create/', postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      alert('Sucessfully Saved')
      setFormData([
        {
          client_name: '',
          business_division_name: '',
          project_name: '',
          month: '',
          sales_revenue: '',
          non_operating_income: '',
          non_operating_expenses: '',
          registered_user_id: localStorage.getItem('userID'),
        },
      ])
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = '/login'
      } else {
        console.error('There was an error creating the project planning data!', error)
      }
    }
  }

  return (
    <div className='project_wrapper'>
      <div className='header_cont'>
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
      <div className='proj_content_wrapper'>
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className='project_data_content'>
          <div className='top_body_cont'></div>
          <div className='mid_body_cont'>
            <div className='mid_btn_cont'>
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
                    (index === 0 ? 'case' : index === 1 ? 'personnel_cost' : index === 2 ? 'expenses' : 'cost_purchase')
                      ? 'body-btn-active body-btn'
                      : 'body-btn'
                  }
                />
              ))}
            </div>
            <div className='mid_form_cont'>
              <p className='form-title'>案件新規登録</p>
              <form onSubmit={handleSubmit}>
                {formData.map((form, index) => (
                  <div key={index} className={`form-content ${index > 0 ? 'form-content-special' : ''}`}>
                    <div className={`form-content ${index > 0 ? 'form-line' : ''}`}></div>
                    <div className='form-content-div'>
                      <div className='left-form-div calc'>
                        <div className='client-name-div'>
                          <label className='client_name'>顧客</label>
                          <select
                            className='select-option'
                            name='client_name'
                            value={form.client_name}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''></option>
                            <option value='TVS'>TVS</option>
                            <option value='TCM'>TCM</option>
                            <option value='JR'>JR</option>
                            <option value='ソルトワークス'>ソルトワークス</option>
                          </select>
                        </div>
                        <div className='business_division_name-div'>
                          <label className='business_division_name'>売上高</label>
                          <input
                            type='number'
                            name='sales_revenue'
                            value={form.sales_revenue}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='project_name-div'>
                          <label className='project_name'>営業外費用</label>
                          <input
                            type='number'
                            name='non_operating_expenses'
                            value={form.non_operating_expenses}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='middle-form-div calc'>
                        <div className='net-sales-div'>
                          <label className='net_sales'>案件名</label>
                          <input
                            type='text'
                            name='project_name'
                            value={form.project_name}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='end_date-div'>
                          <label className='end_yyyymm'>月</label>
                          <select
                            className='select-option'
                            name='month'
                            value={form.month}
                            onChange={(e) => handleChange(index, e)}
                          >
                            <option value=''></option>
                            {months.map((month, idx) => (
                              <option key={idx} value={month}>
                                {month}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className='right-form-div calc'>
                        <div className='non-operating-income-div'>
                          <label className='non_operating_income'>受注事業部</label>
                          <input
                            type='text'
                            name='business_division_name'
                            value={form.business_division_name}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='operating-income-div'>
                          <label className='operating_income'>営業外収益</label>
                          <input
                            type='number'
                            name='non_operating_income'
                            value={form.non_operating_income}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                    </div>
                    <input type='hidden' name='registered_user_id' value={form.registered_user_id} />
                  </div>
                ))}
                <div className='form-content'>
                  <div className='plus-btn'>
                    <button className='inc' type='button' onClick={handleAdd}>
                      +
                    </button>
                    <button className='dec' type='button' onClick={handleMinus}>
                      -
                    </button>
                  </div>
                  <div className='options-btn'>
                    <button type='button' className='button is-light'>
                      キャンセル
                    </button>
                    <button type='submit' className='button is-info'>
                      登録
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDataRegistration
