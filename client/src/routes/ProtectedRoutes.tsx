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

export const handleTimeoutConfirm = async () => {
  window.location.href = '/login'
  return
}


// export const checkAccessToken = () => {
// export async function checkAccessToken() {
  export async function checkAccessToken(setIsAuthorized: (value: boolean | null) => void) {

  
  console.log("checkAccessToken START ---- 001");

  const token = localStorage.getItem(ACCESS_TOKEN);
  console.log("checkAccessToken START ---- 002 AccessToken -> " + token);
  if (!token) {
    console.log("checkAccessToken START ---- 003");
    // setIsAuthorized(false);
    // setIsNonActiveOpen(true);
    return;
  }
  console.log("checkAccessToken START ---- 004");

  const decoded = jwtDecode(token);
  const tokenExpiration = decoded.exp;
  const now = Date.now() / 1000;
  console.log("checkAccessToken START ---- 005");
  if (tokenExpiration < now) {
    // 有効期限を過ぎているのでNG
    console.log("checkAccessToken START ---- 006 有効期限を過ぎているのでNG");
  
    // リフレッシュトークンを再取得して、AccessTokenを更新する
    const refreshed = await refreshToken();
    if (refreshed) {
      console.log("checkAccessToken START ---- 007.1");
      // setIsAuthorized(refreshed);
    } else {
      console.log("checkAccessToken START ---- 007.2");
      return false;
    }
    console.log("checkAccessToken START ---- 007.3");
  } else {
    // 有効期限内でOK
    console.log("checkAccessToken START ---- 008 有効期限内でOK");
    // setIsAuthorized(true);
  }
  return true;
};





  // const _ACCESS_TOKEN  = localStorage.getItem(ACCESS_TOKEN);
  // const endpoint = `${getReactActiveEndpoint()}/api/projects/list/`

  // // localStorageから取得したAccessTokenの有効期限切れチェックを行う
  // try {
  //   console.log("checkAccessToken START ---- 002");
  //   const response = await axios.get(endpoint, {
  //     headers: {
  //       Authorization: `Bearer ${_ACCESS_TOKEN}`,
  //       'Content-Type': 'application/json',
  //     },
  //   })
  //   console.log("checkAccessToken START ---- 003");
  //   return response.data
  // } catch (error) {
  //   console.log("checkAccessToken START ---- 004");
  //   if (error.response && error.response.status === 401) {
  //     console.log("checkAccessToken START ---- 005");
  //     console.log('Unauthorized access - redirecting to login ！！！！！！！')
  //   } else {
  //     console.log("checkAccessToken START ---- 005");
  //     console.error('Error fetching projects ！！！！！:', error)
  //   }
  //   throw error
  // }

// };



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
 
// export const refreshToken = async () => {

//   console.log("refreshToken START ---- 101");

//   const refreshToken = localStorage.getItem(REFRESH_TOKEN);

//   console.log("refreshToken START ---- 102 refreshToken -> " + refreshToken);

//   try {
//     console.log("refreshToken START ---- 103");
//     const res = await api.post("/api/token/refresh/", {
//       refresh: refreshToken,
//     });
//     console.log("refreshToken START ---- 104");
//     if (res.status === 200) {
//       console.log("refreshToken START ---- 105 res.data.access -> " + res.data.access);
//       localStorage.setItem(ACCESS_TOKEN, res.data.access);
//       return true;
//     } else {
//       console.log("refreshToken START ---- 106");
//       return false;
//     }
//   } catch (err) {
//     console.log("refreshToken START ---- 107");
//     console.table(err);
//     return false;
//   }
// };


export const refreshToken = async (onAuthorizeChange?: (status: boolean) => void) => {

  console.log("refreshToken START ---- 101");

  const refreshToken = localStorage.getItem(REFRESH_TOKEN);

  console.log("refreshToken START ---- 102 refreshToken -> " + refreshToken);

  try {
    console.log("refreshToken START ---- 103");
    const res = await api.post("/api/token/refresh/", {
      refresh: refreshToken,
    });
    console.log("refreshToken START ---- 104");
    if (res.status === 200) {
      console.log("refreshToken START ---- 105 res.data.access(AccessToken) -> " + res.data.access);
      localStorage.setItem(ACCESS_TOKEN, res.data.access);

      // コールバックを使用して状態を更新
      if (onAuthorizeChange) {
        onAuthorizeChange(true);
      }

      return true;
    } else {
      console.log("refreshToken START ---- 106");

      if (onAuthorizeChange) {
        onAuthorizeChange(false);
      }

      return false;
    }
  } catch (err) {
    console.log("refreshToken START ---- 107");
    console.table(err);

    if (onAuthorizeChange) {
      onAuthorizeChange(false);
    }

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

  console.log("ProtectedRoutes START ---- 201");

  useEffect(() => {
    auth().catch(() => setIsAuthorized(false));
  }, []);

  const auth = async () => {

    console.log("ProtectedRoutes  ---- 202");
    const token = localStorage.getItem(ACCESS_TOKEN);
    console.log("ProtectedRoutes  ---- 202 AccessToken -> " + token);
    if (!token) {
      console.log("ProtectedRoutes  ---- 203");
      // setIsAuthorized(false);
      setIsNonActiveOpen(true);
      return;
    }
    console.log("ProtectedRoutes  ---- 204");
    const decoded = jwtDecode(token);
    const tokenExpiration = decoded.exp;
    const now = Date.now() / 1000;
    if (tokenExpiration < now) {
      console.log("ProtectedRoutes  ---- 205");
      // const refreshed = await refreshToken();
      const refreshed = await refreshToken((status) => setIsAuthorized(status));
      if (refreshed) {
        console.log("ProtectedRoutes  ---- 206");
        setIsAuthorized(refreshed);
      }
    } else {
      console.log("ProtectedRoutes  ---- 207");
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
    console.log("isAuthorized Loading... 301 isAuthorized -> " + isAuthorized);
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
