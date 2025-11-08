import api from "../src/app/services/axios";


export const registerUser = async (email, username, password) => {
   try {
      const response = await api.post(`register/`, { email, username, password },
         { withCredentials: true }
      )
      return response.data;
   } catch (e) {
      throw e;
   }

}
export const loginUser = async (email, password) => {
   try {
      const response = await api.post(`login/`, { email, password },
         { withCredentials: true }
      )
      localStorage.setItem("loginUser", JSON.stringify(response.data))
      return response.data;
   } catch (e) {
      throw new Error(e, "Login failed!")
   }

}
export const logoutUser = async () => {
   try {
      const response = await api.post(`logout/`,
         { withCredentials: true }
      )
      localStorage.removeItem("loginUser")
      return response.data;
   } catch (e) {
      throw new Error("Logout failed!")
   }

}

export const getUserInfo = async () => {
   try {
      const response = await api.post(`user-info/`,
         { withCredentials: true }
      )
      return response.data;
   } catch (e) {
      throw new Error("Getting User info failed!")
   }

}

//  user authentication utils
export const getUserFromStorage = () => {
   if (typeof window === "undefined") return null; // SSR check
   try {
      const stored = localStorage.getItem("loginUser");
      const parsed = stored && stored !== "undefined" ? JSON.parse(stored) : null;
      return parsed;
   } catch (error) {
      console.warn("Invalid user in localStorage:", error);
      localStorage.removeItem("loginUser");
      return null;
   }
};

// Client side cookie reading function
export const getCookie = (name) => {
   if (typeof window === "undefined") return null;
   const value = `; ${document.cookie}`;
   const parts = value.split(`; ${name}=`);
   if (parts.length === 2) return parts.pop().split(';').shift();
   return null;
};

// Checking if user is authenticated either via localStorage or cookie
export const isAuthenticated = () => {
   const user = getUserFromStorage();
   const token = getCookie('access_token');
   return !!(user || token);
};

// Getting authentication token from cookie
export const getAuthToken = () => {
   return getCookie('access_token');
};

// Token validation utility
export const isValidToken = (token) => {
    if (!token || typeof token !== 'string') return false;
    
    // Basic JWT format validation (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
        //Decoding the payload to check if it's a valid base64
        const payload = JSON.parse(atob(parts[1]));
        
        // Checking if token is expired
        if (payload.exp && payload.exp * 1000 < Date.now()) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
};

// Get validated token
export const getValidatedToken = () => {
    const token = getAuthToken();
    return isValidToken(token) ? token : null;
};