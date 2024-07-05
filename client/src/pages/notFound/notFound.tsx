import React, { useState } from "react";
import Btn from "../../components/Button/Button";
import Sidebar from "../../components/SideBar/Sidebar";
import { useNavigate } from "react-router-dom";

interface ButtonData {
  label: string
  index: number
}

const NotFound = () => {
  const [activeTab, setActiveTab] = useState('plan')
  const navigate = useNavigate()

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate(tab)
  }
  
  return (
    <div className='personnel_wrapper'>
    <div className="header_cont">
      <div className="personnel_top_btn_cont">
        <Btn
            label="分析"
            onClick={() => handleTabClick("/dashboard")}
            className={activeTab === "analysis" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label="計画"
            onClick={() => handleTabClick("/planning")}
            className={activeTab === "plan" ? "h-btn-active header-btn" : "header-btn"}
          />
          <Btn
            label="実績"
            onClick={() => handleTabClick("result")}
            className={activeTab === "result" ? "h-btn-active header-btn" : "header-btn"}
          />
      </div>
     </div>
     <div className="personnel_cont_wrapper">
         <div className="sidebar">
             <Sidebar />
         </div>
         <div className="personnel_wrapper_div">
                 <div className="personnel_top_content">
                     <div className="personnel_top_body_cont">
                     </div>
                     <div className="personnel_mid_body_cont">
                         <div className="personnel_table_wrapper">
                          <div className="has-text-centered not_found">
                              <h1 className="is-size-1 has-text-weight-bold has-text-primary">404</h1>
                              <p className="is-size-5 has-text-weight-medium">
                                {" "}
                                <span className="has-text-danger">Opps!</span> Page not found.
                              </p>
                              <p className="is-size-6 mb-2">
                                The page you’re looking for doesn’t exist.
                              </p>
                              <a href="index.html" className="button is-primary">
                                Go Home
                              </a>
                            </div>
                         </div>
                     </div>
                 </div>
         </div>
     </div>
 </div>
  );
};

export default NotFound;
