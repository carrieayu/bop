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
            <span className="icons"><MdDashboard /></span><Link to="/dashboard">分析</Link>
          </li>
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/planning">計画</Link>
          </li>
          <li className="sub_menu">
            <span className="icons"><FaTableList /></span><Link to="/projectdatalist">プロジェクト一覧</Link>
          </li>
          <li className="sub_menu">
          <span className="icons"><AiFillFileAdd /></span><Link to="/projectcreate">プロジェクト登録</Link>
          </li>
          <li className="sub_menu">
          <span className="icons"><BsPersonFillAdd /></span><Link to="/personnel-expense-create">人件費登録</Link>
          </li>
          <li className="sub_menu">
          <span className="icons"><FaTableList /></span><Link to="/personnel-expenses-list">人件費一覧</Link>
          </li>
          <li>
            <span className="icons"><MdDashboard /></span><Link to="/*">実績</Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;