import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { IStudents, Students } from '../students.model';

import { StudentsService } from './students.service';

describe('Service Tests', () => {
  describe('Students Service', () => {
    let service: StudentsService;
    let httpMock: HttpTestingController;
    let elemDefault: IStudents;
    let expectedResult: IStudents | IStudents[] | boolean | null;

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientTestingModule],
      });
      expectedResult = null;
      service = TestBed.inject(StudentsService);
      httpMock = TestBed.inject(HttpTestingController);

      elemDefault = {
        id: 0,
        firstName: 'AAAAAAA',
        lastName: 'AAAAAAA',
        email: 'AAAAAAA',
        phoneNo: 'AAAAAAA',
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

      it('should create a Students', () => {
        const returnedFromService = Object.assign(
          {
            id: 0,
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.create(new Students()).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'POST' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should update a Students', () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            firstName: 'BBBBBB',
            lastName: 'BBBBBB',
            email: 'BBBBBB',
            phoneNo: 'BBBBBB',
          },
          elemDefault
        );

        const expected = Object.assign({}, returnedFromService);

        service.update(expected).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PUT' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should partial update a Students', () => {
        const patchObject = Object.assign(
          {
            firstName: 'BBBBBB',
            lastName: 'BBBBBB',
          },
          new Students()
        );

        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = Object.assign({}, returnedFromService);

        service.partialUpdate(patchObject).subscribe(resp => (expectedResult = resp.body));

        const req = httpMock.expectOne({ method: 'PATCH' });
        req.flush(returnedFromService);
        expect(expectedResult).toMatchObject(expected);
      });

      it('should return a list of Students', () => {
        const returnedFromService = Object.assign(
          {
            id: 1,
            firstName: 'BBBBBB',
            lastName: 'BBBBBB',
            email: 'BBBBBB',
            phoneNo: 'BBBBBB',
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

      it('should delete a Students', () => {
        service.delete(123).subscribe(resp => (expectedResult = resp.ok));

        const req = httpMock.expectOne({ method: 'DELETE' });
        req.flush({ status: 200 });
        expect(expectedResult);
      });

      describe('addStudentsToCollectionIfMissing', () => {
        it('should add a Students to an empty array', () => {
          const students: IStudents = { id: 123 };
          expectedResult = service.addStudentsToCollectionIfMissing([], students);
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(students);
        });

        it('should not add a Students to an array that contains it', () => {
          const students: IStudents = { id: 123 };
          const studentsCollection: IStudents[] = [
            {
              ...students,
            },
            { id: 456 },
          ];
          expectedResult = service.addStudentsToCollectionIfMissing(studentsCollection, students);
          expect(expectedResult).toHaveLength(2);
        });

        it("should add a Students to an array that doesn't contain it", () => {
          const students: IStudents = { id: 123 };
          const studentsCollection: IStudents[] = [{ id: 456 }];
          expectedResult = service.addStudentsToCollectionIfMissing(studentsCollection, students);
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(students);
        });

        it('should add only unique Students to an array', () => {
          const studentsArray: IStudents[] = [{ id: 123 }, { id: 456 }, { id: 18185 }];
          const studentsCollection: IStudents[] = [{ id: 123 }];
          expectedResult = service.addStudentsToCollectionIfMissing(studentsCollection, ...studentsArray);
          expect(expectedResult).toHaveLength(3);
        });

        it('should accept varargs', () => {
          const students: IStudents = { id: 123 };
          const students2: IStudents = { id: 456 };
          expectedResult = service.addStudentsToCollectionIfMissing([], students, students2);
          expect(expectedResult).toHaveLength(2);
          expect(expectedResult).toContain(students);
          expect(expectedResult).toContain(students2);
        });

        it('should accept null and undefined values', () => {
          const students: IStudents = { id: 123 };
          expectedResult = service.addStudentsToCollectionIfMissing([], null, students, undefined);
          expect(expectedResult).toHaveLength(1);
          expect(expectedResult).toContain(students);
        });

        it('should return initial array if no Students is added', () => {
          const studentsCollection: IStudents[] = [{ id: 123 }];
          expectedResult = service.addStudentsToCollectionIfMissing(studentsCollection, undefined, null);
          expect(expectedResult).toEqual(studentsCollection);
        });
      });
    });

    afterEach(() => {
      httpMock.verify();
    });
  });
});
