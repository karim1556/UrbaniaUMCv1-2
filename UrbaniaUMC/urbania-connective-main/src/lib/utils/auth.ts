import { NavigateFunction } from 'react-router-dom';

type RedirectConfig = {
  path: string;
  action: string;
};

const REDIRECT_MESSAGES = {
  donate: "Please login to make a donation",
  register: "Please login to complete registration",
  volunteer: "Please login to submit a volunteer application"
};

export const handleAuthRedirect = (
  navigate: NavigateFunction,
  currentPath: string,
  type: keyof typeof REDIRECT_MESSAGES
) => {
  navigate("/login", { 
    state: { 
      from: currentPath,
      message: REDIRECT_MESSAGES[type]
    },
    replace: true
  });
}; 