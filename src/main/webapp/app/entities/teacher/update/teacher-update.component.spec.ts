jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { TeacherService } from '../service/teacher.service';
import { ITeacher, Teacher } from '../teacher.model';
import { ICourses } from 'app/entities/courses/courses.model';
import { CoursesService } from 'app/entities/courses/service/courses.service';

import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/user.service';

import { TeacherUpdateComponent } from './teacher-update.component';

describe('Component Tests', () => {
  describe('Teacher Management Update Component', () => {
    let comp: TeacherUpdateComponent;
    let fixture: ComponentFixture<TeacherUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let teacherService: TeacherService;
    let coursesService: CoursesService;
    let userService: UserService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [TeacherUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(TeacherUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(TeacherUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      teacherService = TestBed.inject(TeacherService);
      coursesService = TestBed.inject(CoursesService);
      userService = TestBed.inject(UserService);

      comp = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
      it('Should call Courses query and add missing value', () => {
        const teacher: ITeacher = { id: 456 };
        const courses: ICourses = { id: 19910 };
        teacher.courses = courses;

        const coursesCollection: ICourses[] = [{ id: 77941 }];
        jest.spyOn(coursesService, 'query').mockReturnValue(of(new HttpResponse({ body: coursesCollection })));
        const additionalCourses = [courses];
        const expectedCollection: ICourses[] = [...additionalCourses, ...coursesCollection];
        jest.spyOn(coursesService, 'addCoursesToCollectionIfMissing').mockReturnValue(expectedCollection);

        activatedRoute.data = of({ teacher });
        comp.ngOnInit();

        expect(coursesService.query).toHaveBeenCalled();
        expect(coursesService.addCoursesToCollectionIfMissing).toHaveBeenCalledWith(coursesCollection, ...additionalCourses);
        expect(comp.coursesSharedCollection).toEqual(expectedCollection);
      });

      it('Should call User query and add missing value', () => {
        const teacher: ITeacher = { id: 456 };
        const user: IUser = { id: 48980 };
        teacher.user = user;

        const userCollection: IUser[] = [{ id: 23918 }];
        jest.spyOn(userService, 'query').mockReturnValue(of(new HttpResponse({ body: userCollection })));
        const additionalUsers = [user];
        const expectedCollection: IUser[] = [...additionalUsers, ...userCollection];
        jest.spyOn(userService, 'addUserToCollectionIfMissing').mockReturnValue(expectedCollection);

        activatedRoute.data = of({ teacher });
        comp.ngOnInit();

        expect(userService.query).toHaveBeenCalled();
        expect(userService.addUserToCollectionIfMissing).toHaveBeenCalledWith(userCollection, ...additionalUsers);
        expect(comp.usersSharedCollection).toEqual(expectedCollection);
      });

      it('Should update editForm', () => {
        const teacher: ITeacher = { id: 456 };
        const courses: ICourses = { id: 58 };
        teacher.courses = courses;
        const user: IUser = { id: 24550 };
        teacher.user = user;

        activatedRoute.data = of({ teacher });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(teacher));
        expect(comp.coursesSharedCollection).toContain(courses);
        expect(comp.usersSharedCollection).toContain(user);
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Teacher>>();
        const teacher = { id: 123 };
        jest.spyOn(teacherService, 'update').mockReturnValue(saveSubject);
        jest.spyOn(comp, 'previousState');
        activatedRoute.data = of({ teacher });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: teacher }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(teacherService.update).toHaveBeenCalledWith(teacher);
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Teacher>>();
        const teacher = new Teacher();
        jest.spyOn(teacherService, 'create').mockReturnValue(saveSubject);
        jest.spyOn(comp, 'previousState');
        activatedRoute.data = of({ teacher });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: teacher }));
        saveSubject.complete();

        // THEN
        expect(teacherService.create).toHaveBeenCalledWith(teacher);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it('Should set isSaving to false on error', () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Teacher>>();
        const teacher = { id: 123 };
        jest.spyOn(teacherService, 'update').mockReturnValue(saveSubject);
        jest.spyOn(comp, 'previousState');
        activatedRoute.data = of({ teacher });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error('This is an error!');

        // THEN
        expect(teacherService.update).toHaveBeenCalledWith(teacher);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });

    describe('Tracking relationships identifiers', () => {
      describe('trackCoursesById', () => {
        it('Should return tracked Courses primary key', () => {
          const entity = { id: 123 };
          const trackResult = comp.trackCoursesById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });

      describe('trackUserById', () => {
        it('Should return tracked User primary key', () => {
          const entity = { id: 123 };
          const trackResult = comp.trackUserById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });
    });
  });
});
