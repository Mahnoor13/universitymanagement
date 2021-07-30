import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { StudentsComponent } from '../list/students.component';
import { StudentsDetailComponent } from '../detail/students-detail.component';
import { StudentsUpdateComponent } from '../update/students-update.component';
import { StudentsRoutingResolveService } from './students-routing-resolve.service';

const studentsRoute: Routes = [
  {
    path: '',
    component: StudentsComponent,
    data: {
      defaultSort: 'id,asc',
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    component: StudentsDetailComponent,
    resolve: {
      students: StudentsRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    component: StudentsUpdateComponent,
    resolve: {
      students: StudentsRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    component: StudentsUpdateComponent,
    resolve: {
      students: StudentsRoutingResolveService,
    },
    canActivate: [UserRouteAccessService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(studentsRoute)],
  exports: [RouterModule],
})
export class StudentsRoutingModule {}
