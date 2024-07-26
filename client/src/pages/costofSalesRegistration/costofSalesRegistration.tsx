import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import Sidebar from '../../components/SideBar/Sidebar'
import { useLocation, useNavigate } from 'react-router-dom'

const months = [
   '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2', '3'
];

const CostOfSales = () => {
  const [activeTab, setActiveTab] = useState('/planning')
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTabOther, setActiveTabOther] = useState('case')
  const storedUserID = localStorage.getItem('userID')
  const [formData, setFormData] = useState([
    {
      month: '',
      outsourcing_costs: '',
      communication_costs: '',
      cost_of_sales: '',
      product_purchases: '',
      work_in_progress: '',
      purchases: '',
      dispatch_labor_costs: '',
      amortization: '',
      ordinary_income_margin: '',
      registered_user_id: storedUserID,
    },
  ])

  const handleAdd = () => {
    if (formData.length < 10) {
      const newFormData = [...formData]
      newFormData.push({
        month: '',
        outsourcing_costs: '',
        communication_costs: '',
        cost_of_sales: '',
        product_purchases: '',
        work_in_progress: '',
        purchases: '',
        dispatch_labor_costs: '',
        amortization: '',
        ordinary_income_margin: '',
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


  const handleSubmit = async (e) => {
    e.preventDefault()
    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      // const response = await axios.post('http://127.0.0.1:8000/api/costofsale/create/', formData, {
        const response = await axios.post('http://54.178.202.58:8000/api/costofsale/create/', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      alert('Sucessfully Saved')
      setFormData([
        {
          month: '',
          outsourcing_costs: '',
          communication_costs: '',
          cost_of_sales: '',
          product_purchases: '',
          work_in_progress: '',
          purchases: '',
          dispatch_labor_costs: '',
          amortization: '',
          ordinary_income_margin: '',
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


  useEffect(() => {
  }, [formData])

  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/planning' || path === '/result') {
      setActiveTab(path);
    }
  }, [location.pathname]);

  return (
    <div className="project_wrapper">
      <div className="header_cont">
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
      <div className='proj_content_wrapper'>
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className='project_data_content'>
          <div className='top_body_cont'>
          </div>
          <div className='mid_body_cont'>
            <div className='mid_btn_cont'>
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
            <div className='mid_form_cont costSales'>
              <p className='form-title'>売上原価登録</p>
              <form onSubmit={handleSubmit}>
                {formData.map((form, index) => (
                  <div key={index} className={`form-content ${index > 0 ? 'form-content-special' : ''}`}>
                    <div className={`form-content ${index > 0 ? 'form-line' : ''}`}></div>
                    <div className='form-content-div'>
                      <div className='left-form-div calc'>
                        <div className='client-name-div'>
                          <label className='client_name'>月</label>
                          <select
                            className='select-option'
                            name='month'
                            value={form.month}
                            onChange={(e) => handleChange(index, e)}
                            style={{ textAlign: 'center', textAlignLast: 'center' }}
                          >
                            <option value=''></option>
                              {months.map((month, idx) => (
                                <option key={idx} value={month}>{month}月</option>
                              ))}
                          </select>
                        </div>
                        <div className='business_division_name-div'>
                          <label className='business_division_name'>外注加工費</label>
                          <input
                            type='text'
                            name='outsourcing_costs'
                            value={form.outsourcing_costs}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='project_name-div'>
                          <label className='project_name'>通信費</label>
                          <input
                            type='text'
                            name='communication_costs'
                            value={form.communication_costs}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='middle-form-div calc'>
                        <div className='net-sales-div'>
                          <label className='net_sales'>売上原価</label>
                          <input
                            type='number'
                            name='cost_of_sales'
                            value={form.cost_of_sales}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='cost-of-sales-div'>
                          <label className='cost_of_goods_sold'>商品仕入</label>
                          <input
                            type='number'
                            name='product_purchases'
                            value={form.product_purchases}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='personnel-expenses-div'>
                          <label className='personnel_expenses'>仕掛計上</label>
                          <input
                            type='number'
                            name='work_in_progress'
                            value={form.work_in_progress}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='right-form-div calc'>
                        <div className='non-operating-income-div'>
                          <label className='non_operating_income'>仕入高</label>
                          <input
                            type='number'
                            name='purchases'
                            value={form.purchases}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='operating-income-div'>
                          <label className='operating_income'>派遣人件費</label>
                          <input
                            type='number'
                            name='dispatch_labor_costs'
                            value={form.dispatch_labor_costs}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='ordinary-income-div'>
                          <label className='ordinary_income'>償却計上</label>
                          <input
                            type='number'
                            name='amortization'
                            value={form.amortization}
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

export default CostOfSales
