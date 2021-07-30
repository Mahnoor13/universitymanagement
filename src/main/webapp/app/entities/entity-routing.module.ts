import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'students',
        data: { pageTitle: 'Students' },
        loadChildren: () => import('./students/students.module').then(m => m.StudentsModule),
      },
      {
        path: 'courses',
        data: { pageTitle: 'Courses' },
        loadChildren: () => import('./courses/courses.module').then(m => m.CoursesModule),
      },
      {
        path: 'teacher',
        data: { pageTitle: 'Teachers' },
        loadChildren: () => import('./teacher/teacher.module').then(m => m.TeacherModule),
      },

      /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
    ]),
  ],
})
export class EntityRoutingModule {}
