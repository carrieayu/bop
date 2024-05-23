import React, { useState } from "react";
import Btn from "../../components/Button/Button";
import axios from "axios";
import { HeaderDashboard } from "../../components/header/header";
const ProjectDataRegistration = () => {
  const [activeTab, setActiveTab] = useState("plan");
  const [activeTabOther, setActiveTabOther] = useState("case");
  const [formData, setFormData] = useState({
      client_name: '',
      business_division_name: '',
      project_name: '',
      // start_yyyymm: '',
      // end_yyyymm: '',
      planning: '',
      sales_revenue: '',
      cost_of_goods_sold: '',
      personnel_expenses: '',
      indirect_personnel_cost: '',
      expenses: '',
      non_operating_income: '',
      operating_income: '',
      ordinary_income: '',
      ordinary_income_margin: '',
  })
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    
  };
  const handleTabsClick = (tab) => {
    setActiveTabOther(tab);
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const clientData = {
      client_name: formData.client_name,
    }

    const businessData = {
      business_division_name: formData.business_division_name,
    }

    const planningData = {
      project_name: formData.project_name,
      // start_yyyymm: formData.start_yyyymm,
      // end_yyyymm:   formData.end_yyyymm,
      planning: formData.planning,
      sales_revenue: formData.sales_revenue,
      cost_of_goods_sold: formData.cost_of_goods_sold,
      personnel_expense: formData.personnel_expenses,
      indirect_personnel_cost: formData.indirect_personnel_cost,
      expenses: formData.expenses,
      non_operating_income: formData.non_operating_income,
      operating_income: formData.operating_income,
      ordinary_income: formData. ordinary_income,
      ordinary_income_margin: formData.ordinary_income_margin,
    }

    axios.post('http://127.0.0.1:8000/api/projectplanning/create/', formData)
    .then(response => {
      console.log(response.data);
    })
    .catch(error => {
      console.log("test" , error);
    })
  }


  return (
    <div className="parent-div">
      <HeaderDashboard value=""/>
      <div className="inner-div">
        <div className="header-container">
          <div className="btn-content">
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
        </div>
        <div className="body-container">
          <div className="body-top">
            {[...Array(6)].map((_, index) => (
              <Btn
                key={index}
                label={index === 0 ? "案件" : 
                index === 1 ? "人件費" : 
                index === 2 ? "経費" : 
                index === 3 ? "原価 - 仕入" : 
                index === 4 ? "原価-外注費" : "原価 - 通信費"
                }
                onClick={() => handleTabsClick(index === 0 ? "case" : 
                index === 1 ? "personnel_cost" : 
                index === 2 ? "expenses" :
                index === 3 ? "cost_purchase" :
                index === 4 ? "price_outsourcing" : "communication_cost" )}
                className={activeTabOther === (index === 0 ? "case" : 
                index === 1 ? "personnel_cost" : 
                index === 2 ? "expenses" :
                index === 3 ? "cost_purchase" :
                index === 4 ? "price_outsourcing" :"communication_cost") ? "body-btn-active body-btn" : "body-btn"}
              />
            ))}
          </div>
          <div className="form-title">
            <p className="form-header">案件新規登録</p>
              <form action="">
                <div className="inp-form">
                  <form action="">
                    <table className="table-layout">
                      <thead>
                        <tr>
                          <th>顧客</th>
                          <th>受注事業部</th>
                          <th>案件名</th>
                          <th>開始年月</th>
                          <th>終了年月</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="dropdown-select">
                            <div className="select">
                            <select className="select-option" name="client_name" value={formData.client_name} onChange={handleChange}>
                              <option value=""></option>
                              <option  value="TVS">TVS</option>
                              <option  value="TCM">TCM</option>
                              <option  value="JR">JR</option>
                              <option  value="ソルトワークス">ソルトワークス</option>
                            </select>
                            </div>
                          </td>
                          <td><input type="text" name="business_division_name" value={formData.business_division_name} onChange={handleChange} /></td>
                          <td><input type="text" name="project_name" value={formData.project_name} onChange={handleChange}/></td>
                          <td><input type="text" name="planning" value={formData.planning} onChange={handleChange}/></td>
                          <td><input type="text" /></td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="table-layout">
                      <thead>
                        <tr>
                          <th>売上高</th>
                          <th>売上原価</th>
                          <th>人件費</th>
                          <th>間接人件費</th>
                          <th>経費</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                          <input type="number" name="sales_revenue" value={formData.sales_revenue} onChange={handleChange} />
                          </td>
                          <td><input type="number" name="cost_of_goods_sold" value={formData.cost_of_goods_sold} onChange={handleChange} /></td>
                          <td><input type="number" name="personnel_expenses" value={formData.personnel_expenses} onChange={handleChange}/></td>
                          <td><input type="number" name="indirect_personnel_cost" value={formData.indirect_personnel_cost} onChange={handleChange}/></td>
                          <td><input type="number" name="expenses" value={formData.expenses} onChange={handleChange}/></td>
                        </tr>
                      </tbody>
                    </table>
                    <table className="table-layout">
                      <thead>
                        <tr className="trd-row-h">
                          <th>営業外収益</th>
                          <th className="hide-th"></th>
                          <th>営業利益</th>
                          <th>経常利益</th>
                          <th>経常利益率</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="trd-row">
                          <td><input type="number" name="non_operating_income" value={formData.non_operating_income} onChange={handleChange}/></td>
                          <td className="hide"></td>
                          <td><input type="number" name="operating_income" value={formData.operating_income} onChange={handleChange}/></td>
                          <td><input type="number" name="ordinary_income" value={formData.ordinary_income} onChange={handleChange}/></td>
                          <td><input type="number" name="ordinary_income_margin" value={formData.ordinary_income_margin} onChange={handleChange}/></td>
                        
                        </tr>
                      </tbody>
                    </table>
                    <div className="plus-btn">
                      <button className="inc">+</button>
                      <button className="dec">-</button>
                    </div>
                    <div className="options-btn">
                      <button type="button" className="cancel">キャンセル</button>
                      <button type="submit" className="register">登録</button>
                    </div>
                  </form>
                </div>
              </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDataRegistration;