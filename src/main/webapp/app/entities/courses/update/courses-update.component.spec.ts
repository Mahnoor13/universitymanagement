jest.mock('@angular/router');

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';

import { CoursesService } from '../service/courses.service';
import { ICourses, Courses } from '../courses.model';
import { IStudents } from 'app/entities/students/students.model';
import { StudentsService } from 'app/entities/students/service/students.service';
import { ITeacher } from 'app/entities/teacher/teacher.model';
import { TeacherService } from 'app/entities/teacher/service/teacher.service';

import { CoursesUpdateComponent } from './courses-update.component';

describe('Component Tests', () => {
  describe('Courses Management Update Component', () => {
    let comp: CoursesUpdateComponent;
    let fixture: ComponentFixture<CoursesUpdateComponent>;
    let activatedRoute: ActivatedRoute;
    let coursesService: CoursesService;
    let studentsService: StudentsService;
    let teacherService: TeacherService;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
        declarations: [CoursesUpdateComponent],
        providers: [FormBuilder, ActivatedRoute],
      })
        .overrideTemplate(CoursesUpdateComponent, '')
        .compileComponents();

      fixture = TestBed.createComponent(CoursesUpdateComponent);
      activatedRoute = TestBed.inject(ActivatedRoute);
      coursesService = TestBed.inject(CoursesService);
      studentsService = TestBed.inject(StudentsService);
      teacherService = TestBed.inject(TeacherService);

      comp = fixture.componentInstance;
    });

    describe('ngOnInit', () => {
      it('Should call Students query and add missing value', () => {
        const courses: ICourses = { id: 456 };
        const students: IStudents = { id: 88258 };
        courses.students = students;

        const studentsCollection: IStudents[] = [{ id: 46042 }];
        jest.spyOn(studentsService, 'query').mockReturnValue(of(new HttpResponse({ body: studentsCollection })));
        const additionalStudents = [students];
        const expectedCollection: IStudents[] = [...additionalStudents, ...studentsCollection];
        jest.spyOn(studentsService, 'addStudentsToCollectionIfMissing').mockReturnValue(expectedCollection);

        activatedRoute.data = of({ courses });
        comp.ngOnInit();

        expect(studentsService.query).toHaveBeenCalled();
        expect(studentsService.addStudentsToCollectionIfMissing).toHaveBeenCalledWith(studentsCollection, ...additionalStudents);
        expect(comp.studentsSharedCollection).toEqual(expectedCollection);
      });

      it('Should call Teacher query and add missing value', () => {
        const courses: ICourses = { id: 456 };
        const teacher: ITeacher = { id: 39108 };
        courses.teacher = teacher;

        const teacherCollection: ITeacher[] = [{ id: 18433 }];
        jest.spyOn(teacherService, 'query').mockReturnValue(of(new HttpResponse({ body: teacherCollection })));
        const additionalTeachers = [teacher];
        const expectedCollection: ITeacher[] = [...additionalTeachers, ...teacherCollection];
        jest.spyOn(teacherService, 'addTeacherToCollectionIfMissing').mockReturnValue(expectedCollection);

        activatedRoute.data = of({ courses });
        comp.ngOnInit();

        expect(teacherService.query).toHaveBeenCalled();
        expect(teacherService.addTeacherToCollectionIfMissing).toHaveBeenCalledWith(teacherCollection, ...additionalTeachers);
        expect(comp.teachersSharedCollection).toEqual(expectedCollection);
      });

      it('Should update editForm', () => {
        const courses: ICourses = { id: 456 };
        const students: IStudents = { id: 10525 };
        courses.students = students;
        const teacher: ITeacher = { id: 55290 };
        courses.teacher = teacher;

        activatedRoute.data = of({ courses });
        comp.ngOnInit();

        expect(comp.editForm.value).toEqual(expect.objectContaining(courses));
        expect(comp.studentsSharedCollection).toContain(students);
        expect(comp.teachersSharedCollection).toContain(teacher);
      });
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Courses>>();
        const courses = { id: 123 };
        jest.spyOn(coursesService, 'update').mockReturnValue(saveSubject);
        jest.spyOn(comp, 'previousState');
        activatedRoute.data = of({ courses });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: courses }));
        saveSubject.complete();

        // THEN
        expect(comp.previousState).toHaveBeenCalled();
        expect(coursesService.update).toHaveBeenCalledWith(courses);
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Courses>>();
        const courses = new Courses();
        jest.spyOn(coursesService, 'create').mockReturnValue(saveSubject);
        jest.spyOn(comp, 'previousState');
        activatedRoute.data = of({ courses });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.next(new HttpResponse({ body: courses }));
        saveSubject.complete();

        // THEN
        expect(coursesService.create).toHaveBeenCalledWith(courses);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).toHaveBeenCalled();
      });

      it('Should set isSaving to false on error', () => {
        // GIVEN
        const saveSubject = new Subject<HttpResponse<Courses>>();
        const courses = { id: 123 };
        jest.spyOn(coursesService, 'update').mockReturnValue(saveSubject);
        jest.spyOn(comp, 'previousState');
        activatedRoute.data = of({ courses });
        comp.ngOnInit();

        // WHEN
        comp.save();
        expect(comp.isSaving).toEqual(true);
        saveSubject.error('This is an error!');

        // THEN
        expect(coursesService.update).toHaveBeenCalledWith(courses);
        expect(comp.isSaving).toEqual(false);
        expect(comp.previousState).not.toHaveBeenCalled();
      });
    });

    describe('Tracking relationships identifiers', () => {
      describe('trackStudentsById', () => {
        it('Should return tracked Students primary key', () => {
          const entity = { id: 123 };
          const trackResult = comp.trackStudentsById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });

      describe('trackTeacherById', () => {
        it('Should return tracked Teacher primary key', () => {
          const entity = { id: 123 };
          const trackResult = comp.trackTeacherById(0, entity);
          expect(trackResult).toEqual(entity.id);
        });
      });
    });
  });
});
