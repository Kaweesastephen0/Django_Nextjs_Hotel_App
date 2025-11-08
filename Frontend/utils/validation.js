// Input validation utilities

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) return { isValid: false, message: "Email is required" };
  if (!emailRegex.test(email)) return { isValid: false, message: "Please enter a valid email address" };
  
  return { isValid: true, message: "" };
};

export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: "Password is required" };
  if (password.length < 6) return { isValid: false, message: "Password must be at least 6 characters long" };
  if (!/(?=.*[a-z])/.test(password)) return { isValid: false, message: "Password must contain at least one lowercase letter" };
  if (!/(?=.*[A-Z])/.test(password)) return { isValid: false, message: "Password must contain at least one uppercase letter" };
  if (!/(?=.*\d)/.test(password)) return { isValid: false, message: "Password must contain at least one number" };
  
  return { isValid: true, message: "" };
};

export const validateUsername = (username) => {
  if (!username) return { isValid: false, message: "Username is required" };
  if (username.length < 3) return { isValid: false, message: "Username must be at least 3 characters long" };
  if (username.length > 20) return { isValid: false, message: "Username must be less than 20 characters" };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { isValid: false, message: "Username can only contain letters, numbers, and underscores" };
  
  return { isValid: true, message: "" };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.trim() === "") {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true, message: "" };
};

export const validateDate = (date, fieldName = "Date") => {
  if (!date) return { isValid: false, message: `${fieldName} is required` };
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return { isValid: false, message: `Please enter a valid ${fieldName.toLowerCase()}` };
  
  return { isValid: true, message: "" };
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, message: "Please enter valid dates" };
  }
  
  if (start >= end) {
    return { isValid: false, message: "End date must be after start date" };
  }
  
  if (start < new Date().setHours(0, 0, 0, 0)) {
    return { isValid: false, message: "Start date cannot be in the past" };
  }
  
  return { isValid: true, message: "" };
};

// Validate multiple fields at once
export const validateForm = (fields) => {
  const errors = {};
  let isFormValid = true;
  
  Object.entries(fields).forEach(([fieldName, { value, validators }]) => {
    for (const validator of validators) {
      const result = validator(value, fieldName);
      if (!result.isValid) {
        errors[fieldName] = result.message;
        isFormValid = false;
        break; // Stop at first error for this field
      }
    }
  });
  
  return { isValid: isFormValid, errors };
};
