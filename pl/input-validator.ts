import { ValidationException } from "../bll/exceptions";

// Валідація на рівні PL
export class InputValidator {
  static getNonEmptyString(message: string): string {
    const value = prompt(message);
    if (!value) {
      throw new ValidationException("Input cannot be empty.");
    }
    return value;
  }

  static getNumber(message: string): number {
    const value = prompt(message);
    const number = parseFloat(String(value));
    if (isNaN(number)) {
      throw new ValidationException("Invalid number format.");
    }
    return number;
  }

  static getDate(message: string): Date {
    const value = prompt(message + " (YYYY-MM-DD): ");
    if (!value) {
      throw new ValidationException("Invalid date format. Use YYYY-MM-DD.");
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new ValidationException("Invalid date format. Use YYYY-MM-DD.");
    }
    return date;
  }
}
