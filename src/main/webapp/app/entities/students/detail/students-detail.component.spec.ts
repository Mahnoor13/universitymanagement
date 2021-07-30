import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { StudentsDetailComponent } from './students-detail.component';

describe('Component Tests', () => {
  describe('Students Management Detail Component', () => {
    let comp: StudentsDetailComponent;
    let fixture: ComponentFixture<StudentsDetailComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [StudentsDetailComponent],
        providers: [
          {
            provide: ActivatedRoute,
            useValue: { data: of({ students: { id: 123 } }) },
          },
        ],
      })
        .overrideTemplate(StudentsDetailComponent, '')
        .compileComponents();
      fixture = TestBed.createComponent(StudentsDetailComponent);
      comp = fixture.componentInstance;
    });

    describe('OnInit', () => {
      it('Should load students on init', () => {
        // WHEN
        comp.ngOnInit();

        // THEN
        expect(comp.students).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
  });
});
