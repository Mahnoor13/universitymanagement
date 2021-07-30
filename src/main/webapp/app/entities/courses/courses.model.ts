import { IStudents } from 'app/entities/students/students.model';
import { ITeacher } from 'app/entities/teacher/teacher.model';

export interface ICourses {
  id?: number;
  courseName?: string | null;
  creditHour?: number | null;
  students?: IStudents | null;
  teacher?: ITeacher | null;
}

export class Courses implements ICourses {
  constructor(
    public id?: number,
    public courseName?: string | null,
    public creditHour?: number | null,
    public students?: IStudents | null,
    public teacher?: ITeacher | null
  ) {}
}

export function getCoursesIdentifier(courses: ICourses): number | undefined {
  return courses.id;
}
