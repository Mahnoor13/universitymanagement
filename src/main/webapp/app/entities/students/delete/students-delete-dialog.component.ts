import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { IStudents } from '../students.model';
import { StudentsService } from '../service/students.service';

@Component({
  templateUrl: './students-delete-dialog.component.html',
})
export class StudentsDeleteDialogComponent {
  students?: IStudents;

  constructor(protected studentsService: StudentsService, protected activeModal: NgbActiveModal) {}

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.studentsService.delete(id).subscribe(() => {
      this.activeModal.close('deleted');
    });
  }
}
