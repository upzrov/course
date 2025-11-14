import { randomUUIDv7 } from "bun";

export class Stadium {
  private _id: string;
  private _name: string;
  private _capacity: number;
  private _ticketPrice: number;

  constructor(name: string, capacity: number, ticketPrice: number) {
    this._id = randomUUIDv7();
    this._name = name;
    this._capacity = capacity;
    this._ticketPrice = ticketPrice;
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }

  get capacity(): number {
    return this._capacity;
  }
  set capacity(value: number) {
    if (value < 0) throw new Error("Capacity cannot be negative");
    this._capacity = value;
  }

  get ticketPrice(): number {
    return this._ticketPrice;
  }
  set ticketPrice(value: number) {
    if (value < 0) throw new Error("Ticket price cannot be negative");
    this._ticketPrice = value;
  }

  getInfo(): string {
    return `[${this.id}] Stadium: ${this.name}, Capacity: ${this.capacity}, Ticket: $${this.ticketPrice}`;
  }
}
