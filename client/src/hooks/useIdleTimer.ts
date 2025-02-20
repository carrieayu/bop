import { useState, useEffect } from "react";
import { setupIdleTimer } from '../utils/helperFunctionsUtil'
import { ACCESS_TOKEN } from "../constants";

export const useIdleTimer = (onIdle: () => void, IDLE_TIMEOUT: number) => {
    const [isIdle, setIsIdle] = useState(false);
    const [isIdleModalOpen, setIsIdleModalOpen] = useState(false);

    // タイムアウトオーバ時
    useEffect(() => {
      const idleTimer = setupIdleTimer(() => {
        setIsIdle(true);
        setIsIdleModalOpen(true);
        onIdle();
      }, IDLE_TIMEOUT);
      idleTimer.startListening();
      return () => idleTimer.stopListening();
    }, [onIdle, IDLE_TIMEOUT]);

    // token情報の紛失
    useEffect(() => {
      const interval = setInterval(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
          sessionStorage.setItem("showAlert", "ON");
          sessionStorage.setItem("showAlertInitialized", "true");
          setIsIdleModalOpen(true);
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }, []);

    // ログイン画面への遷移
    const handleNonActiveConfirm = () => {
      setIsIdleModalOpen(false);
      sessionStorage.removeItem("showAlert");
      sessionStorage.removeItem("showAlertInitialized");
      window.location.href = "/login";
    };

    return { isIdle, isIdleModalOpen, handleNonActiveConfirm, setIsIdleModalOpen };
  };