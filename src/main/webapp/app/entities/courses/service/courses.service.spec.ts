import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ICourses, Courses } from '../courses.model';

import { CoursesService } from './courses.service';

describe('Service Tests', () => {
  describe('Courses Service', () => {
    let service: CoursesService;
    let httpMock: HttpTestingController;
    let elemDefault: ICourses;
    let expectedResult: ICourses | ICourses[] | boolean | null;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
      expectedResult = null;
      service = TestBed.inject(CoursesService);
      httpMock = TestBed.inject(HttpTestingController);

      elemDefault = {
        id: 0,
        courseName: 'AAAAAAA',
        creditHour: 0,
      };
    });

    describe('Service methods', () => {
      it('should find an element', () => {
        const returnedFromService = Object.assign({}, elemDefault);

        service.find(123).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(elemDefault);
      });

      it('should create a Courses', () => {
        const returnedFromService = Object.assign(
          {
            id: 0,
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.create(new Courses()).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'POST' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should update a Courses', () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            courseName: 'BBBBBB',
            creditHour: 1,
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.update(expected).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PUT' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should partial update a Courses', () => {
        const patchObject = Object.assign({}, new Courses());

        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = Object.assign({}, returnedFromService);

        service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PATCH' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should return a list of Courses', () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            courseName: 'BBBBBB',
            creditHour: 1,
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.query().subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'GET' });
        req.flush([returnedFromService]);
        httpMock.verify();
        expect(expectedResult).toContainEqual(expected);
      });

      it('should delete a Courses', () => {
        service.delete(123).subscribe(resp => (expectedResult = resp.ok));

        const req = httpMock.expectOne({ method: 'DELETE' });
        req.flush({ status: 200 });
        expect(expectedResult);
      });

      describe('addCoursesToCollectionIfMissing', () => {
        it('should add a Courses to an empty array', () => {
          const courses: ICourses = { id: 123 };
          expectedResult = service.addCoursesToCollectionIfMissing([], courses);
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(courses);
        });

        it('should not add a Courses to an array that contains it', () => {
          const courses: ICourses = { id: 123 };
          const coursesCollection: ICourses[] = [
            {
              ...courses,
            },
            { id: 456 },
          ];
          expectedResult = service.addCoursesToCollectionIfMissing(coursesCollection, courses);
          expect(expectedResult).toHaveLength(2);
        });

        it("should add a Courses to an array that doesn't contain it", () => {
          const courses: ICourses = { id: 123 };
          const coursesCollection: ICourses[] = [{ id: 456 }];
          expectedResult = service.addCoursesToCollectionIfMissing(coursesCollection, courses);
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(courses);
        });

        it('should add only unique Courses to an array', () => {
          const coursesArray: ICourses[] = [{ id: 123 }, { id: 456 }, { id: 17686 }];
          const coursesCollection: ICourses[] = [{ id: 123 }];
          expectedResult = service.addCoursesToCollectionIfMissing(coursesCollection, ...coursesArray);
          expect(expectedResult).toHaveLength(3);
        });

        it('should accept varargs', () => {
          const courses: ICourses = { id: 123 };
          const courses2: ICourses = { id: 456 };
          expectedResult = service.addCoursesToCollectionIfMissing([], courses, courses2);
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(courses);
          expect(expectedResult).toContain(courses2);
        });

        it('should accept null and undefined values', () => {
          const courses: ICourses = { id: 123 };
          expectedResult = service.addCoursesToCollectionIfMissing([], null, courses, undefined);
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(courses);
        });

        it('should return initial array if no Courses is added', () => {
          const coursesCollection: ICourses[] = [{ id: 123 }];
          expectedResult = service.addCoursesToCollectionIfMissing(coursesCollection, undefined, null);
          expect(expectedResult).toEqual(coursesCollection);
        });
      });
    });

    afterEach(() => {
      httpMock.verify();
    });
  });
});
