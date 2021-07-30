import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { Resolve, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, EMPTY } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IStudents, Students } from '../students.model';
import { StudentsService } from '../service/students.service';

@Injectable({ providedIn: 'root' })
export class StudentsRoutingResolveService implements Resolve<IStudents> {
  constructor(protected service: StudentsService, protected router: Router) {}

  resolve(route: ActivatedRouteSnapshot): Observable<IStudents> | Observable<never> {
    const id = route.params['id'];
    if (id) {
      return this.service.find(id).pipe(
        mergeMap((students: HttpResponse<Students>) => {
          if (students.body) {
            return of(students.body);
          } else {
            this.router.navigate(['404']);
            return EMPTY;
          }
        })
      );
    }
    return of(new Students());
  }
}
