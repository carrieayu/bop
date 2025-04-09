const local = 'http://127.0.0.1:8000';
const live = 'http://54.178.202.58:8000';

const isLocalEnvironment = (): boolean => {
  const hostname = window.location.hostname;
  return hostname === '127.0.0.1' || hostname === 'localhost';
};

export const getReactActiveEndpoint = (): string => {
  return isLocalEnvironment() ? local : live;
};