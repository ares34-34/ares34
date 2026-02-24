// ============================================
// ARES34 - Validación de contraseña enterprise
// ============================================

export interface PasswordValidation {
  isValid: boolean;
  errors: string[];
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSymbol: boolean;
  };
}

const MIN_PASSWORD_LENGTH = 12;

export function validatePassword(password: string): PasswordValidation {
  const checks = {
    minLength: password.length >= MIN_PASSWORD_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password),
  };

  const errors: string[] = [];

  if (!checks.minLength) {
    errors.push(`Mínimo ${MIN_PASSWORD_LENGTH} caracteres`);
  }
  if (!checks.hasUppercase) {
    errors.push('Al menos una letra mayúscula');
  }
  if (!checks.hasLowercase) {
    errors.push('Al menos una letra minúscula');
  }
  if (!checks.hasNumber) {
    errors.push('Al menos un número');
  }
  if (!checks.hasSymbol) {
    errors.push('Al menos un símbolo (!@#$%...)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    checks,
  };
}

export { MIN_PASSWORD_LENGTH };
