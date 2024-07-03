import React, { useEffect, useState } from 'react'
import Btn from '../../components/Button/Button'
import axios from 'axios'
import { HeaderDashboard } from '../../components/header/header'
import Sidebar from '../../components/SideBar/Sidebar'

const ProjectDataRegistration = () => {
  const [activeTab, setActiveTab] = useState('plan')
  const [activeTabOther, setActiveTabOther] = useState('case')
  const storedUserID = localStorage.getItem('userID')
  const [formData, setFormData] = useState([
    {
      client_name: '',
      business_division_name: '',
      project_name: '',
      start_yyyymm: '',
      end_yyyymm: '',
      sales_revenue: '',
      cost_of_goods_sold: '',
      personnel_expenses: '',
      indirect_personnel_cost: '',
      expenses: '',
      non_operating_income: '',
      operating_income: '',
      ordinary_income: '',
      ordinary_income_margin: '',
      registered_user_id: storedUserID,
      company_id: '',
    },
  ])

  const handleAdd = () => {
    if (formData.length < 10) {
      const newFormData = [...formData]
      newFormData.push({
        client_name: '',
        business_division_name: '',
        project_name: '',
        start_yyyymm: '',
        end_yyyymm: '',
        sales_revenue: '',
        cost_of_goods_sold: '',
        personnel_expenses: '',
        indirect_personnel_cost: '',
        expenses: '',
        non_operating_income: '',
        operating_income: '',
        ordinary_income: '',
        ordinary_income_margin: '',
        registered_user_id: storedUserID,
        company_id: '',
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
        start_yyyymm: formData.map((c) => c.start_yyyymm),
        end_yyyymm: formData.map((c) => c.end_yyyymm),
        sales_revenue: formData.map((c) => c.sales_revenue),
        cost_of_goods_sold: formData.map((c) => c.cost_of_goods_sold),
        personnel_expenses: formData.map((c) => c.personnel_expenses),
        indirect_personnel_cost: formData.map((c) => c.indirect_personnel_cost),
        expenses: formData.map((c) => c.expenses),
        non_operating_income: formData.map((c) => c.non_operating_income),
        operating_income: formData.map((c) => c.operating_income),
        ordinary_income: formData.map((c) => c.ordinary_income),
        ordinary_income_margin: formData.map((c) => c.ordinary_income_margin),
      },
      registered_user_id: formData.map((c) => c.registered_user_id),
    }

    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/projectplanning/create/', postData, {
        // const response = await axios.post('http://54.178.202.58:8000/api/projectplanning/create/', postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      console.log(response.data)
      alert('Sucessfully Saved')
      setFormData([
        {
          client_name: '',
          business_division_name: '',
          project_name: '',
          start_yyyymm: '',
          end_yyyymm: '',
          sales_revenue: '',
          cost_of_goods_sold: '',
          personnel_expenses: '',
          indirect_personnel_cost: '',
          expenses: '',
          non_operating_income: '',
          operating_income: '',
          ordinary_income: '',
          ordinary_income_margin: '',
          registered_user_id: localStorage.getItem('userID'),
          company_id: '',
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
    <div className="project_wrapper">
      <div className="header_cont">
          <Btn
            label="分析"
            onClick={() => handleTabClick("analysis")}
            className={activeTab === "analysis" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label="計画"
            onClick={() => handleTabClick("plan")}
            className={activeTab === "plan" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label="実績"
            onClick={() => handleTabClick("result")}
            className={activeTab === "result" ? "h-btn-active header-btn" : "header-btn"}
          />
      </div>
      <div className='proj_content_wrapper'>
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className='project_data_content'>
          <div className='top_body_cont'>
            <div className='top_btn_cont'>
              <Btn
                label='分析'
                onClick={() => handleTabClick('analysis')}
                className={activeTab === 'analysis' ? 'h-btn-active header-btn' : 'header-btn'}
              />
              <Btn
                label='計画'
                onClick={() => handleTabClick('plan')}
                className={activeTab === 'plan' ? 'h-btn-active header-btn' : 'header-btn'}
              />
              <Btn
                label='実績'
                onClick={() => handleTabClick('result')}
                className={activeTab === 'result' ? 'h-btn-active header-btn' : 'header-btn'}
              />
            </div>
          </div>
          <div className='mid_body_cont'>
            <div className='mid_btn_cont'>
              {[...Array(6)].map((_, index) => (
                <Btn
                  key={index}
                  label={
                    index === 0
                      ? '案件'
                      : index === 1
                        ? '人件費'
                        : index === 2
                          ? '経費'
                          : index === 3
                            ? '原価 - 仕入'
                            : index === 4
                              ? '原価-外注費'
                              : '原価 - 通信費'
                  }
                  onClick={() =>
                    handleTabsClick(
                      index === 0
                        ? 'case'
                        : index === 1
                          ? 'personnel_cost'
                          : index === 2
                            ? 'expenses'
                            : index === 3
                              ? 'cost_purchase'
                              : index === 4
                                ? 'price_outsourcing'
                                : 'communication_cost',
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
                          : index === 3
                            ? 'cost_purchase'
                            : index === 4
                              ? 'price_outsourcing'
                              : 'communication_cost')
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
                          <label className='business_division_name'>受注事業部</label>
                          <input
                            type='text'
                            name='business_division_name'
                            value={form.business_division_name}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='project_name-div'>
                          <label className='project_name'>案件名</label>
                          <input
                            type='text'
                            name='project_name'
                            value={form.project_name}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='start_date-div'>
                          <label className='start_yyyymm'>開始年月</label>
                          <input
                            type='text'
                            name='start_yyyymm'
                            value={form.start_yyyymm}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='end_date-div'>
                          <label className='end_yyyymm'>終了年月</label>
                          <input
                            type='text'
                            name='end_yyyymm'
                            value={form.end_yyyymm}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='middle-form-div calc'>
                        <div className='net-sales-div'>
                          <label className='net_sales'>売上高</label>
                          <input
                            type='number'
                            name='sales_revenue'
                            value={form.sales_revenue}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='cost-of-sales-div'>
                          <label className='cost_of_goods_sold'>売上原価</label>
                          <input
                            type='number'
                            name='cost_of_goods_sold'
                            value={form.cost_of_goods_sold}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='personnel-expenses-div'>
                          <label className='personnel_expenses'>人件費</label>
                          <input
                            type='number'
                            name='personnel_expenses'
                            value={form.personnel_expenses}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='indirect-personnel-cost-div'>
                          <label className='indirect_personnel_cost'>間接人件費</label>
                          <input
                            type='number'
                            name='indirect_personnel_cost'
                            value={form.indirect_personnel_cost}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='expenses-div'>
                          <label className='expenses'>経費</label>
                          <input
                            type='number'
                            name='expenses'
                            value={form.expenses}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                      </div>
                      <div className='right-form-div calc'>
                        <div className='non-operating-income-div'>
                          <label className='non_operating_income'>営業外収益</label>
                          <input
                            type='number'
                            name='non_operating_income'
                            value={form.non_operating_income}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='operating-income-div'>
                          <label className='operating_income'>営業利益</label>
                          <input
                            type='number'
                            name='operating_income'
                            value={form.operating_income}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='ordinary-income-div'>
                          <label className='ordinary_income'>経常利益</label>
                          <input
                            type='number'
                            name='ordinary_income'
                            value={form.ordinary_income}
                            onChange={(e) => handleChange(index, e)}
                          />
                        </div>
                        <div className='ordinary-income-margin-div'>
                          <label className='ordinary_income_margin'>経常利益率</label>
                          <input
                            type='number'
                            name='ordinary_income_margin'
                            value={form.ordinary_income_margin}
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
