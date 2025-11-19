import { randomUUIDv7 } from "bun";
import { HealthStatus, PlayerStatus } from "../enums";
import type { Identifiable } from "./identifiable";

export class Player implements Identifiable {
  private _id: string;
  private _firstName: string;
  private _lastName: string;
  private _birthDate: Date;
  private _status: PlayerStatus;
  private _healthStatus: HealthStatus;
  private _salary: number;

  constructor(
    firstName: string,
    lastName: string,
    birthDate: Date,
    salary: number
  ) {
    this._id = randomUUIDv7();
    this._firstName = firstName;
    this._lastName = lastName;
    this._birthDate = birthDate;
    this._salary = salary;
    this._status = PlayerStatus.FreeAgent;
    this._healthStatus = HealthStatus.Healthy;
  }

  get id(): string {
    return this._id;
  }

  get firstName(): string {
    return this._firstName;
  }
  set firstName(value: string) {
    if (!value) throw new Error("First name cannot be empty");
    this._firstName = value;
  }

  get lastName(): string {
    return this._lastName;
  }
  set lastName(value: string) {
    if (!value) throw new Error("Last name cannot be empty");
    this._lastName = value;
  }

  get birthDate(): Date {
    return this._birthDate;
  }
  set birthDate(value: Date) {
    this._birthDate = value;
  }

  get status(): PlayerStatus {
    return this._status;
  }
  set status(value: PlayerStatus) {
    this._status = value;
  }

  get healthStatus(): HealthStatus {
    return this._healthStatus;
  }
  set healthStatus(value: HealthStatus) {
    this._healthStatus = value;
  }

  get salary(): number {
    return this._salary;
  }
  set salary(value: number) {
    if (value < 0) throw new Error("Salary cannot be negative");
    this._salary = value;
  }

  // Метод для зручного відображення
  getInfo(): string {
    return `[${this.id}] ${this.firstName} ${
      this.lastName
    } (Born: ${this.birthDate.toLocaleDateString()}), Salary: ${
      this.salary
    }, Status: ${this.status}`;
  }
}
