// Validation utility functions for the E-Truck Transport System

export interface ValidationResult {
  isValid: boolean
  message: string
}

// Zambian phone number validation
export const validateZambianPhone = (phone: string): ValidationResult => {
  // Remove all spaces, dashes, and plus signs for validation
  const cleanPhone = phone.replace(/[\s\-+]/g, "")

  // Zambian phone patterns:
  // Mobile: 09XXXXXXXX (10 digits starting with 09)
  // With country code: 26009XXXXXXXX or 26097XXXXXXX, 26096XXXXXXX, 26095XXXXXXX
  // International format: +26009XXXXXXXX

  const zambianMobilePattern = /^(260)?(09[567]\d{7}|07[567]\d{7})$/
  const localMobilePattern = /^(09[567]\d{7}|07[567]\d{7})$/

  if (localMobilePattern.test(cleanPhone)) {
    return { isValid: true, message: "Valid Zambian mobile number" }
  }

  if (zambianMobilePattern.test(cleanPhone)) {
    return { isValid: true, message: "Valid Zambian mobile number with country code" }
  }

  return {
    isValid: false,
    message: "Invalid phone number. Use format: 0977123456 or +260977123456 (MTN/Airtel/Zamtel)",
  }
}

// Zambian driving license validation
export const validateZambianLicense = (license: string): ValidationResult => {
  // Remove spaces and convert to uppercase
  const cleanLicense = license.replace(/\s/g, "").toUpperCase()

  // Zambian license format: DL followed by 8-9 digits
  // Example: DL12345678 or DL123456789
  const licensePattern = /^DL\d{8,9}$/

  if (!licensePattern.test(cleanLicense)) {
    return {
      isValid: false,
      message: "Invalid license format. Use: DL followed by 8-9 digits (e.g., DL12345678)",
    }
  }

  return { isValid: true, message: "Valid Zambian driving license number" }
}

// Zambian vehicle plate number validation
export const validateZambianPlate = (plate: string): ValidationResult => {
  // Remove spaces and convert to uppercase
  const cleanPlate = plate.replace(/\s/g, "").toUpperCase()

  // Zambian plate formats:
  // Standard: ABC123ZM (3 letters, 3 digits, ZM)
  // Commercial: ABC1234ZM (3 letters, 4 digits, ZM)
  // Government: GRZ123A (GRZ, 3 digits, 1 letter)

  const standardPlatePattern = /^[A-Z]{3}\d{3}ZM$/
  const commercialPlatePattern = /^[A-Z]{3}\d{4}ZM$/
  const governmentPlatePattern = /^GRZ\d{3}[A-Z]$/

  if (
    standardPlatePattern.test(cleanPlate) ||
    commercialPlatePattern.test(cleanPlate) ||
    governmentPlatePattern.test(cleanPlate)
  ) {
    return { isValid: true, message: "Valid Zambian vehicle plate number" }
  }

  return {
    isValid: false,
    message: "Invalid plate format. Use: ABC123ZM, ABC1234ZM, or GRZ123A",
  }
}

// Vehicle engine number validation
export const validateEngineNumber = (engineNumber: string): ValidationResult => {
  // Remove spaces and convert to uppercase
  const cleanEngine = engineNumber.replace(/\s/g, "").toUpperCase()

  // Engine numbers are typically alphanumeric, 8-17 characters
  // Common formats: ABC123456789, 1234567890123456, AB1234567890
  const enginePattern = /^[A-Z0-9]{8,17}$/

  if (!enginePattern.test(cleanEngine)) {
    return {
      isValid: false,
      message: "Invalid engine number. Must be 8-17 alphanumeric characters",
    }
  }

  // Check for obviously fake patterns
  if (/^(.)\1{7,}$/.test(cleanEngine)) {
    // All same character
    return {
      isValid: false,
      message: "Engine number appears invalid (repeated characters)",
    }
  }

  if (/^(123456789|987654321|ABCDEFGH)/.test(cleanEngine)) {
    // Sequential patterns
    return {
      isValid: false,
      message: "Engine number appears invalid (sequential pattern)",
    }
  }

  return { isValid: true, message: "Valid engine number format" }
}

// Vehicle chassis/VIN number validation
export const validateChassisNumber = (chassisNumber: string): ValidationResult => {
  // Remove spaces and convert to uppercase
  const cleanChassis = chassisNumber.replace(/\s/g, "").toUpperCase()

  // VIN/Chassis numbers are 17 characters, alphanumeric (no I, O, Q)
  const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/

  if (!vinPattern.test(cleanChassis)) {
    return {
      isValid: false,
      message: "Invalid chassis number. Must be 17 alphanumeric characters (no I, O, Q)",
    }
  }

  // Check for obviously fake patterns
  if (/^(.)\1{16}$/.test(cleanChassis)) {
    // All same character
    return {
      isValid: false,
      message: "Chassis number appears invalid (repeated characters)",
    }
  }

  return { isValid: true, message: "Valid chassis number format" }
}

// Employee ID validation
export const validateEmployeeId = (employeeId: string, role: "border-agent" | "admin"): ValidationResult => {
  // Remove spaces and convert to uppercase
  const cleanId = employeeId.replace(/\s/g, "").toUpperCase()

  let pattern: RegExp
  let expectedFormat: string

  if (role === "border-agent") {
    // Border agent format: EMP followed by 6 digits
    pattern = /^EMP\d{6}$/
    expectedFormat = "EMP123456"
  } else {
    // Admin format: MOT followed by 6 digits (Ministry of Transport)
    pattern = /^MOT\d{6}$/
    expectedFormat = "MOT123456"
  }

  if (!pattern.test(cleanId)) {
    return {
      isValid: false,
      message: `Invalid employee ID format. Use: ${expectedFormat}`,
    }
  }

  return { isValid: true, message: "Valid employee ID format" }
}

// Email validation (enhanced)
export const validateEmail = (email: string): ValidationResult => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

  if (!emailPattern.test(email)) {
    return {
      isValid: false,
      message: "Invalid email format",
    }
  }

  // Check for common typos in domain
  const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "transport.gov.zm"]
  const domain = email.split("@")[1]?.toLowerCase()

  if (domain && !commonDomains.includes(domain) && !domain.includes(".")) {
    return {
      isValid: false,
      message: "Email domain appears invalid. Check spelling.",
    }
  }

  return { isValid: true, message: "Valid email format" }
}

// Date validation (not in future, not too old)
export const validateDate = (dateString: string, fieldName: string): ValidationResult => {
  const date = new Date(dateString)
  const now = new Date()
  const hundredYearsAgo = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate())

  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      message: `Invalid ${fieldName} date`,
    }
  }

  if (date > now) {
    return {
      isValid: false,
      message: `${fieldName} cannot be in the future`,
    }
  }

  if (date < hundredYearsAgo) {
    return {
      isValid: false,
      message: `${fieldName} cannot be more than 100 years ago`,
    }
  }

  return { isValid: true, message: `Valid ${fieldName}` }
}

// License expiry validation (must be in future)
export const validateLicenseExpiry = (dateString: string): ValidationResult => {
  const date = new Date(dateString)
  const now = new Date()
  const tenYearsFromNow = new Date(now.getFullYear() + 10, now.getMonth(), now.getDate())

  if (isNaN(date.getTime())) {
    return {
      isValid: false,
      message: "Invalid expiry date",
    }
  }

  if (date <= now) {
    return {
      isValid: false,
      message: "License expiry date must be in the future",
    }
  }

  if (date > tenYearsFromNow) {
    return {
      isValid: false,
      message: "License expiry date seems too far in the future",
    }
  }

  return { isValid: true, message: "Valid license expiry date" }
}

// Name validation (no numbers, reasonable length)
export const validateName = (name: string): ValidationResult => {
  const cleanName = name.trim()

  if (cleanName.length < 2) {
    return {
      isValid: false,
      message: "Name must be at least 2 characters long",
    }
  }

  if (cleanName.length > 50) {
    return {
      isValid: false,
      message: "Name cannot exceed 50 characters",
    }
  }

  // Allow letters, spaces, hyphens, apostrophes
  const namePattern = /^[a-zA-Z\s\-']+$/

  if (!namePattern.test(cleanName)) {
    return {
      isValid: false,
      message: "Name can only contain letters, spaces, hyphens, and apostrophes",
    }
  }

  // Check for obviously fake names
  const fakePatternsPattern = /^(test|admin|user|driver|agent|sample|example|abc|xyz|qwerty|asdf)/i

  if (fakePatternsPattern.test(cleanName)) {
    return {
      isValid: false,
      message: "Please enter your real name",
    }
  }

  return { isValid: true, message: "Valid name" }
}

// Weight validation (for trucks)
export const validateWeight = (weight: string, type: "gross" | "net"): ValidationResult => {
  const numWeight = Number.parseFloat(weight)

  if (isNaN(numWeight) || numWeight <= 0) {
    return {
      isValid: false,
      message: `Invalid ${type} weight. Must be a positive number`,
    }
  }

  const maxWeight = type === "gross" ? 80000 : 40000 // kg
  const minWeight = type === "gross" ? 5000 : 2000 // kg

  if (numWeight > maxWeight) {
    return {
      isValid: false,
      message: `${type} weight cannot exceed ${maxWeight}kg`,
    }
  }

  if (numWeight < minWeight) {
    return {
      isValid: false,
      message: `${type} weight cannot be less than ${minWeight}kg`,
    }
  }

  return { isValid: true, message: `Valid ${type} weight` }
}
