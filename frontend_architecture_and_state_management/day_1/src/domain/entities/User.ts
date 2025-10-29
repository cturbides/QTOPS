import { Email } from "../valueObjects/Email";

/**
 * User Entity
 */
export interface User {
  id: string;
  name: string;
  email: Email;
}
