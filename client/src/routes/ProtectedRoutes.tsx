  import React, { useState, useEffect, Children } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";
import { REFRESH_TOKEN, ACCESS_TOKEN, IDLE_TIMEOUT } from "../constants";
import { setupIdleTimer } from '../utils/helperFunctionsUtil'
import AlertModal from "../components/AlertModal/AlertModal";
import { translate } from '../utils/translationUtil'
import { useLanguage } from '../contexts/LanguageContext'
import axios from 'axios'
import { getReactActiveEndpoint } from '../toggleEndpoint'

interface ProtectedRoutesProps {
  children: any;
}

export async function checkAccessToken() {
  // AccessToken取得できるか
  const token = localStorage.getItem(ACCESS_TOKEN);
  if (!token) {
    return false;
  }
  // AccessTokenが取得できる場合、有効期限内かどうか
  const decoded = jwtDecode(token);
  const tokenExpiration = decoded.exp;
  const now = Date.now() / 1000;
  if (tokenExpiration < now) {
    // 有効期限を過ぎている場合、RefreshTokenを元に更新する
    const refreshed = await refreshToken();
    if (refreshed) {
      return true;
    } else {
      // RefreshTokenの有効期限が切れている時はエラーとする
      return false;
    }
  } else {
    return true;
  }
};

export const useAlertPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);
  const { language, setLanguage } = useLanguage()

  const showAlertPopup = (onConfirm: () => void) => {
    setOnConfirm(() => onConfirm);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
    setOnConfirm(null);
  };

  const handleNotConfirmClick = () => {
    window.location.href = "/login";
  };

  const AlertPopupComponent = () => (
    <AlertModal
      isOpen={isOpen}
      onConfirm={() => {
        if (onConfirm) onConfirm();
        handleNotConfirmClick();
      }}
      onCancel={null}
      message={translate('nonActiveMessage', language)}
    />
  );

  return { showAlertPopup, AlertPopupComponent };
};
 
export const refreshToken = async () => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  try {
    const res = await api.post("/api/token/refresh/", {
      refresh: refreshToken,
    });
    if (res.status === 200) {
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.table(err);
    return false;
  }
};

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isNonActiveOpen, setIsNonActiveOpen] = useState<boolean>(false);
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const auth = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) {
      // setIsAuthorized(false);
      setIsNonActiveOpen(true);
      return;
    }
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;
    if (tokenExpiration < now) {
      const refreshed = await refreshToken();
      if (refreshed) {
        setIsAuthorized(refreshed);
      }
    } else {
      setIsAuthorized(true);
    }
  };

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === ACCESS_TOKEN && !event.newValue) {
        setIsNonActiveOpen(true);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const idleTimer = setupIdleTimer(() => {
      refreshToken().catch(() => setIsNonActiveOpen(true));
    }, IDLE_TIMEOUT);
    idleTimer.startListening();
    return () => idleTimer.stopListening();
  }, [IDLE_TIMEOUT]);

  const handleNotConfirmClick = () => {
    setIsNonActiveOpen(false);
    setTimeout(() => {
      window.location.href = "/login";
    }, 0);
  };

  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isNonActiveOpen && (
        <AlertModal
          isOpen={isNonActiveOpen}
          onConfirm={handleNotConfirmClick}
          onCancel={null}
          message={translate('nonActiveMessage', language)}
        />
      )}
      {isAuthorized ? children : <Navigate to="/login" />}
    </>
  );

};

export default ProtectedRoutes;
