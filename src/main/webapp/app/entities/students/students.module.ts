import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';
import { StudentsComponent } from './list/students.component';
import { StudentsDetailComponent } from './detail/students-detail.component';
import { StudentsUpdateComponent } from './update/students-update.component';
import { StudentsDeleteDialogComponent } from './delete/students-delete-dialog.component';
import { StudentsRoutingModule } from './route/students-routing.module';

@NgModule({
  imports: [SharedModule, StudentsRoutingModule],
  declarations: [StudentsComponent, StudentsDetailComponent, StudentsUpdateComponent, StudentsDeleteDialogComponent],
  entryComponents: [StudentsDeleteDialogComponent],
})
export class StudentsModule {}
