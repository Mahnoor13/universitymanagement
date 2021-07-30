import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ICourses, Courses } from '../courses.model';
import { CoursesService } from '../service/courses.service';
import { IStudents } from 'app/entities/students/students.model';
import { StudentsService } from 'app/entities/students/service/students.service';
import { ITeacher } from 'app/entities/teacher/teacher.model';
import { TeacherService } from 'app/entities/teacher/service/teacher.service';

@Component({
  selector: 'jhi-courses-update',
  templateUrl: './courses-update.component.html',
})
export class CoursesUpdateComponent implements OnInit {
  isSaving = false;

  studentsSharedCollection: IStudents[] = [];
  teachersSharedCollection: ITeacher[] = [];

  editForm = this.fb.group({
    id: [],
    courseName: [],
    creditHour: [],
    students: [],
    teacher: [],
  });

  constructor(
    protected coursesService: CoursesService,
    protected studentsService: StudentsService,
    protected teacherService: TeacherService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ courses }) => {
      this.updateForm(courses);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const courses = this.createFromForm();
    if (courses.id !== undefined) {
      this.subscribeToSaveResponse(this.coursesService.update(courses));
    } else {
      this.subscribeToSaveResponse(this.coursesService.create(courses));
    }
  }

  trackStudentsById(index: number, item: IStudents): number {
    return item.id!;
  }

  trackTeacherById(index: number, item: ITeacher): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ICourses>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe(
      () => this.onSaveSuccess(),
      () => this.onSaveError()
    );
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(courses: ICourses): void {
    this.editForm.patchValue({
      id: courses.id,
      courseName: courses.courseName,
      creditHour: courses.creditHour,
      students: courses.students,
      teacher: courses.teacher,
    });

    this.studentsSharedCollection = this.studentsService.addStudentsToCollectionIfMissing(this.studentsSharedCollection, courses.students);
    this.teachersSharedCollection = this.teacherService.addTeacherToCollectionIfMissing(this.teachersSharedCollection, courses.teacher);
  }

  protected loadRelationshipsOptions(): void {
    this.studentsService
      .query()
      .pipe(map((res: HttpResponse<IStudents[]>) => res.body ?? []))
      .pipe(
        map((students: IStudents[]) =>
          this.studentsService.addStudentsToCollectionIfMissing(students, this.editForm.get('students')!.value)
        )
      )
      .subscribe((students: IStudents[]) => (this.studentsSharedCollection = students));

    this.teacherService
      .query()
      .pipe(map((res: HttpResponse<ITeacher[]>) => res.body ?? []))
      .pipe(
        map((teachers: ITeacher[]) => this.teacherService.addTeacherToCollectionIfMissing(teachers, this.editForm.get('teacher')!.value))
      )
      .subscribe((teachers: ITeacher[]) => (this.teachersSharedCollection = teachers));
  }

  protected createFromForm(): ICourses {
    return {
      ...new Courses(),
      id: this.editForm.get(['id'])!.value,
      courseName: this.editForm.get(['courseName'])!.value,
      creditHour: this.editForm.get(['creditHour'])!.value,
      students: this.editForm.get(['students'])!.value,
      teacher: this.editForm.get(['teacher'])!.value,
    };
  }
}
