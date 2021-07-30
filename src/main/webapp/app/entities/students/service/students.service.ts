import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IStudents, getStudentsIdentifier } from '../students.model';

export type EntityResponseType = HttpResponse<IStudents>;
export type EntityArrayResponseType = HttpResponse<IStudents[]>;

@Injectable({ providedIn: 'root' })
export class StudentsService {
  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/students');

  constructor(protected http: HttpClient, protected applicationConfigService: ApplicationConfigService) {}

  create(students: IStudents): Observable<EntityResponseType> {
    return this.http.post<IStudents>(this.resourceUrl, students, { observe: 'response' });
  }

  update(students: IStudents): Observable<EntityResponseType> {
    return this.http.put<IStudents>(`${this.resourceUrl}/${getStudentsIdentifier(students) as number}`, students, { observe: 'response' });
  }

  partialUpdate(students: IStudents): Observable<EntityResponseType> {
    return this.http.patch<IStudents>(`${this.resourceUrl}/${getStudentsIdentifier(students) as number}`, students, {
      observe: 'response',
    });
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http.get<IStudents>(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http.get<IStudents[]>(this.resourceUrl, { params: options, observe: 'response' });
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  addStudentsToCollectionIfMissing(studentsCollection: IStudents[], ...studentsToCheck: (IStudents | null | undefined)[]): IStudents[] {
    const students: IStudents[] = studentsToCheck.filter(isPresent);
    if (students.length > 0) {
      const studentsCollectionIdentifiers = studentsCollection.map(studentsItem => getStudentsIdentifier(studentsItem)!);
      const studentsToAdd = students.filter(studentsItem => {
        const studentsIdentifier = getStudentsIdentifier(studentsItem);
        if (studentsIdentifier == null || studentsCollectionIdentifiers.includes(studentsIdentifier)) {
          return false;
        }
        studentsCollectionIdentifiers.push(studentsIdentifier);
        return true;
      });
      return [...studentsToAdd, ...studentsCollection];
    }
    return studentsCollection;
  }
}
