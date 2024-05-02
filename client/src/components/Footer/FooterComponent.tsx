import React from 'react';
import dattLogo from '../../assets/images/logo.png';
import { FaGithub, FaTwitter, FaFacebook } from 'react-icons/fa';

const FooterComponent = () => {
  return (
    <footer className="footer custom-footer">
      <div className="columns is-mobile">
        <div className="column is-narrow">
          <img className="side-image" src={dattLogo} alt="Footer image" />
        </div>
        <div className="column right-side">
          <div className="content has-text-centered has-text-centered-custom">
            <ul className="footer-content">
              <li className="custom-li-li">
                <strong className="is-uppercase">Sample by Footer</strong>
              </li>
              <li>
                <strong>Sample content for Footer</strong>
              </li>
              <li className="inline-list custom-li">
                <a href="#"><FaGithub /> GitHub</a>
                <a href="#"><FaTwitter /> Twitter</a>
                <a href="#"><FaFacebook /> Facebook</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
