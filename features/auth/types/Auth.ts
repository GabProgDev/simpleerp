import { EmployeeRole } from '../../employees/types/Employee';

export interface UserSession {
  id: string;
  name: string;
  username: string;
  role: EmployeeRole;
}