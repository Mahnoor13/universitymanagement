import { ICourses } from 'app/entities/courses/courses.model';
import { IUser } from 'app/entities/user/user.model';

export interface ITeacher {
  id?: number;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  courses?: ICourses | null;
  user?: IUser | null;
}

export class Teacher implements ITeacher {
  constructor(
    public id?: number,
    public firstName?: string | null,
    public lastName?: string | null,
    public phone?: string | null,
    public courses?: ICourses | null,
    public user?: IUser | null
  ) {}
}

export function getTeacherIdentifier(teacher: ITeacher): number | undefined {
  return teacher.id;
}
