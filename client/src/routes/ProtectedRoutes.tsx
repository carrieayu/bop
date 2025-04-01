import React, { useState, useEffect, Children } from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api/api";
import { REFRESH_TOKEN, ACCESS_TOKEN, IDLE_TIMEOUT } from "../constants";
import { setupIdleTimer } from '../utils/helperFunctionsUtil'
import AlertModal from "../components/AlertModal/AlertModal";
import { translate } from '../utils/translationUtil'
import { useLanguage } from '../contexts/LanguageContext'

interface ProtectedRoutesProps {
  children: any;
}

export const handleTimeoutConfirm = async () => {
  window.location.href = '/login'
  return
}

export async function checkAccessToken(setIsAuthorized: (value: boolean | null) => void) {
  try {
    const refreshed = await refreshToken();
    if (!refreshed) {
      setIsAuthorized(true);
      return false;
    }
    const token = localStorage.getItem(ACCESS_TOKEN);
    const decoded = jwtDecode(token);
    const accessTokenExpiration = decoded.exp;
    const now = Date.now() / 1000;
    if (accessTokenExpiration < now) {
      setIsAuthorized(true);
      return false;
    } else {
      setIsAuthorized(false);
      return true;
    }
  } catch (err) {
    return false;
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

export const refreshToken = async (onAuthorizeChange?: (status: boolean) => void) => {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN);
  try {
    const decoded = jwtDecode(refreshToken);
    const refreshTokenExpiration = decoded.exp;
    const now = Date.now() / 1000;
    if (refreshTokenExpiration < now) {
      if (onAuthorizeChange) {
        onAuthorizeChange(false);
      }
      return false;
    }
    const res = await api.post("/api/token/refresh/", {
      refresh: refreshToken,
    });
    if (res.status === 200) {
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      if (onAuthorizeChange) {
        onAuthorizeChange(true);
      }
      return true;
    } else {
      if (onAuthorizeChange) {
        onAuthorizeChange(false);
      }
      return false;
    }
  } catch (err) {
    return false;
  }
};

const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isNonActiveOpen, setIsNonActiveOpen] = useState<boolean>(false);
  const {language, setLanguage} = useLanguage()
  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);
  const auth = async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN);
    if (!accessToken) {
      setIsNonActiveOpen(true);
      return;
    }
    const decoded = jwtDecode(accessToken);
    const accessTokenExpiration = decoded.exp;
    const now = Date.now() / 1000;
    if (accessTokenExpiration < now) {
      const refreshed = await refreshToken((status) => {
        setIsAuthorized(status);
        if (!status) {
          setIsNonActiveOpen(true);
        }
      });
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
      if (event.key === REFRESH_TOKEN && !event.newValue) {
        setIsNonActiveOpen(true);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const logout = () => {
    localStorage.clear()
    setIsAuthorized(false)
  }
  useEffect(() => {
    const idleTimer = setupIdleTimer(() => {
      logout()
    }, IDLE_TIMEOUT);
    idleTimer.startListening();
    return () => {
      idleTimer.stopListening();
    };
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
