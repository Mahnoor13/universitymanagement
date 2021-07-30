import { Component, OnInit } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import { ITeacher, Teacher } from '../teacher.model';
import { TeacherService } from '../service/teacher.service';
import { ICourses } from 'app/entities/courses/courses.model';
import { CoursesService } from 'app/entities/courses/service/courses.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

@Component({
  selector: 'jhi-teacher-update',
  templateUrl: './teacher-update.component.html',
})
export class TeacherUpdateComponent implements OnInit {
  isSaving = false;

  coursesSharedCollection: ICourses[] = [];
  usersSharedCollection: IUser[] = [];

  editForm = this.fb.group({
    id: [],
    firstName: [],
    lastName: [],
    phone: [],
    courses: [],
    user: [],
  });

  constructor(
    protected teacherService: TeacherService,
    protected coursesService: CoursesService,
    protected userService: UserService,
    protected activatedRoute: ActivatedRoute,
    protected fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ teacher }) => {
      this.updateForm(teacher);

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const teacher = this.createFromForm();
    if (teacher.id !== undefined) {
      this.subscribeToSaveResponse(this.teacherService.update(teacher));
    } else {
      this.subscribeToSaveResponse(this.teacherService.create(teacher));
    }
  }

  trackCoursesById(index: number, item: ICourses): number {
    return item.id!;
  }

  trackUserById(index: number, item: IUser): number {
    return item.id!;
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITeacher>>): void {
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

  protected updateForm(teacher: ITeacher): void {
    this.editForm.patchValue({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      phone: teacher.phone,
      courses: teacher.courses,
      user: teacher.user,
    });

    this.coursesSharedCollection = this.coursesService.addCoursesToCollectionIfMissing(this.coursesSharedCollection, teacher.courses);
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing(this.usersSharedCollection, teacher.user);
  }

  protected loadRelationshipsOptions(): void {
    this.coursesService
      .query()
      .pipe(map((res: HttpResponse<ICourses[]>) => res.body ?? []))
      .pipe(map((courses: ICourses[]) => this.coursesService.addCoursesToCollectionIfMissing(courses, this.editForm.get('courses')!.value)))
      .subscribe((courses: ICourses[]) => (this.coursesSharedCollection = courses));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing(users, this.editForm.get('user')!.value)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }

  protected createFromForm(): ITeacher {
    return {
      ...new Teacher(),
      id: this.editForm.get(['id'])!.value,
      firstName: this.editForm.get(['firstName'])!.value,
      lastName: this.editForm.get(['lastName'])!.value,
      phone: this.editForm.get(['phone'])!.value,
      courses: this.editForm.get(['courses'])!.value,
      user: this.editForm.get(['user'])!.value,
    };
  }
}
