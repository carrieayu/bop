import React, { useState } from 'react';
import PropTypes from 'prop-types';

const DropDown = ({ data, defaultLabel, customClass, onClick, onChange, defaultValue }) => {
  const [activeMenuItem, setActiveMenuItem] = useState(null);

  const handleMenuItemClick = (index) => {
    if (activeMenuItem === index) {
      setActiveMenuItem(null);
    } else {
      setActiveMenuItem(index);
    }
    onClick && onClick(index);
    onChange && onChange(index);
  };
  

  return (
    <nav>
      <ul className={`mainMenu ${customClass}`}>
        {data.map((menuItem, index) => (
          <li key={index} onClick={() => handleMenuItemClick(index)} className={activeMenuItem === index ? 'active' : ''}>
            <a href={menuItem.link} className={`${customClass}`}>{menuItem.label}</a>
            {menuItem.children.length > 0 && (
              <ul className="subMenu">
                {menuItem.children.map((subMenuItem, subIndex) => (
                  <li key={subIndex} onClick={() => handleMenuItemClick(index + '.' + subIndex)} className={activeMenuItem === (index + '.' + subIndex) ? 'active' : ''}>
                    <a href={subMenuItem.link}>{subMenuItem.label}</a>
                    {subMenuItem.children.length > 0 && (
                      <ul className="supersubMenu">
                        {subMenuItem.children.map((superSubMenuItem, superSubIndex) => (
                          <li key={superSubIndex} onClick={() => handleMenuItemClick(index + '.' + subIndex + '.' + superSubIndex)} className={activeMenuItem === (index + '.' + subIndex + '.' + superSubIndex) ? 'active' : ''}>
                            <a href={superSubMenuItem.link}>{superSubMenuItem.label}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      </nav>
  );
};

DropDown.propTypes = {
  data: PropTypes.array.isRequired,
  defaultLabel: PropTypes.string,
  customClass: PropTypes.string,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  defaultValue: PropTypes.any
};

DropDown.defaultProps = {
  defaultLabel: 'Select',
  customClass: '',
  defaultValue: null
};

export default DropDown;