import React from 'react';
import { Link } from 'react-router-dom';
import { MdDashboard } from "react-icons/md";
import { FaTableList } from "react-icons/fa6";
import { BsPersonFillAdd } from "react-icons/bs";
import { AiFillFileAdd } from "react-icons/ai";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-nav">
        <ul>
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/dashboard">仪表板</Link>
          </li>
          <li>
            <span className="icons"><AiFillFileAdd /></span><Link to="/projectcreate">项目数据注册</Link>
          </li>
          <li>
          <span className="icons"><FaTableList /></span><Link to="/projectdatalist">项目数据清单</Link>
          </li>
          <li>
          <span className="icons"><BsPersonFillAdd /></span><Link to="">人件費登録</Link>
          </li>
          <li>
          <span className="icons"><FaTableList /></span><Link to="/personnel-expenses-list">人件費リスト</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;