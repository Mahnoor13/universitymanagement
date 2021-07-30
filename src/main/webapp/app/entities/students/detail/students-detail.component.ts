import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { IStudents } from '../students.model';

@Component({
  selector: 'jhi-students-detail',
  templateUrl: './students-detail.component.html',
})
export class StudentsDetailComponent implements OnInit {
  students: IStudents | null = null;

  constructor(protected activatedRoute: ActivatedRoute) {}

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ students }) => {
      this.students = students;
    });
  }

  previousState(): void {
    window.history.back();
  }
}
