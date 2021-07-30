import { IUser } from 'app/entities/user/user.model';

export interface IStudents {
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  email?: string;
  phoneNo?: string | null;
  user?: IUser | null;
}

export class Students implements IStudents {
  constructor(
    public id?: number,
    public firstName?: string | null,
    public lastName?: string | null,
    public email?: string,
    public phoneNo?: string | null,
    public user?: IUser | null
  ) {}
}

export function getStudentsIdentifier(students: IStudents): number | undefined {
  return students.id;
}
