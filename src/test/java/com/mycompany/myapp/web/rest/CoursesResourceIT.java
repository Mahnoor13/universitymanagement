package com.mycompany.myapp.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Courses;
import com.mycompany.myapp.repository.CoursesRepository;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link CoursesResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class CoursesResourceIT {

    private static final String DEFAULT_COURSE_NAME = "AAAAAAAAAA";
    private static final String UPDATED_COURSE_NAME = "BBBBBBBBBB";

    private static final Integer DEFAULT_CREDIT_HOUR = 1;
    private static final Integer UPDATED_CREDIT_HOUR = 2;

    private static final String ENTITY_API_URL = "/api/courses";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private CoursesRepository coursesRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCoursesMockMvc;

    private Courses courses;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Courses createEntity(EntityManager em) {
        Courses courses = new Courses().courseName(DEFAULT_COURSE_NAME).creditHour(DEFAULT_CREDIT_HOUR);
        return courses;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Courses createUpdatedEntity(EntityManager em) {
        Courses courses = new Courses().courseName(UPDATED_COURSE_NAME).creditHour(UPDATED_CREDIT_HOUR);
        return courses;
    }

    @BeforeEach
    public void initTest() {
        courses = createEntity(em);
    }

    @Test
    @Transactional
    void createCourses() throws Exception {
        int databaseSizeBeforeCreate = coursesRepository.findAll().size();
        // Create the Courses
        restCoursesMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(courses)))
            .andExpect(status().isCreated());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeCreate + 1);
        Courses testCourses = coursesList.get(coursesList.size() - 1);
        assertThat(testCourses.getCourseName()).isEqualTo(DEFAULT_COURSE_NAME);
        assertThat(testCourses.getCreditHour()).isEqualTo(DEFAULT_CREDIT_HOUR);
    }

    @Test
    @Transactional
    void createCoursesWithExistingId() throws Exception {
        // Create the Courses with an existing ID
        courses.setId(1L);

        int databaseSizeBeforeCreate = coursesRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCoursesMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(courses)))
            .andExpect(status().isBadRequest());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllCourses() throws Exception {
        // Initialize the database
        coursesRepository.saveAndFlush(courses);

        // Get all the coursesList
        restCoursesMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(courses.getId().intValue())))
            .andExpect(jsonPath("$.[*].courseName").value(hasItem(DEFAULT_COURSE_NAME)))
            .andExpect(jsonPath("$.[*].creditHour").value(hasItem(DEFAULT_CREDIT_HOUR)));
    }

    @Test
    @Transactional
    void getCourses() throws Exception {
        // Initialize the database
        coursesRepository.saveAndFlush(courses);

        // Get the courses
        restCoursesMockMvc
            .perform(get(ENTITY_API_URL_ID, courses.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(courses.getId().intValue()))
            .andExpect(jsonPath("$.courseName").value(DEFAULT_COURSE_NAME))
            .andExpect(jsonPath("$.creditHour").value(DEFAULT_CREDIT_HOUR));
    }

    @Test
    @Transactional
    void getNonExistingCourses() throws Exception {
        // Get the courses
        restCoursesMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewCourses() throws Exception {
        // Initialize the database
        coursesRepository.saveAndFlush(courses);

        int databaseSizeBeforeUpdate = coursesRepository.findAll().size();

        // Update the courses
        Courses updatedCourses = coursesRepository.findById(courses.getId()).get();
        // Disconnect from session so that the updates on updatedCourses are not directly saved in db
        em.detach(updatedCourses);
        updatedCourses.courseName(UPDATED_COURSE_NAME).creditHour(UPDATED_CREDIT_HOUR);

        restCoursesMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedCourses.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedCourses))
            )
            .andExpect(status().isOk());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeUpdate);
        Courses testCourses = coursesList.get(coursesList.size() - 1);
        assertThat(testCourses.getCourseName()).isEqualTo(UPDATED_COURSE_NAME);
        assertThat(testCourses.getCreditHour()).isEqualTo(UPDATED_CREDIT_HOUR);
    }

    @Test
    @Transactional
    void putNonExistingCourses() throws Exception {
        int databaseSizeBeforeUpdate = coursesRepository.findAll().size();
        courses.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCoursesMockMvc
            .perform(
                put(ENTITY_API_URL_ID, courses.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(courses))
            )
            .andExpect(status().isBadRequest());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCourses() throws Exception {
        int databaseSizeBeforeUpdate = coursesRepository.findAll().size();
        courses.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCoursesMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(courses))
            )
            .andExpect(status().isBadRequest());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCourses() throws Exception {
        int databaseSizeBeforeUpdate = coursesRepository.findAll().size();
        courses.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCoursesMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(courses)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCoursesWithPatch() throws Exception {
        // Initialize the database
        coursesRepository.saveAndFlush(courses);

        int databaseSizeBeforeUpdate = coursesRepository.findAll().size();

        // Update the courses using partial update
        Courses partialUpdatedCourses = new Courses();
        partialUpdatedCourses.setId(courses.getId());

        partialUpdatedCourses.creditHour(UPDATED_CREDIT_HOUR);

        restCoursesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCourses.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCourses))
            )
            .andExpect(status().isOk());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeUpdate);
        Courses testCourses = coursesList.get(coursesList.size() - 1);
        assertThat(testCourses.getCourseName()).isEqualTo(DEFAULT_COURSE_NAME);
        assertThat(testCourses.getCreditHour()).isEqualTo(UPDATED_CREDIT_HOUR);
    }

    @Test
    @Transactional
    void fullUpdateCoursesWithPatch() throws Exception {
        // Initialize the database
        coursesRepository.saveAndFlush(courses);

        int databaseSizeBeforeUpdate = coursesRepository.findAll().size();

        // Update the courses using partial update
        Courses partialUpdatedCourses = new Courses();
        partialUpdatedCourses.setId(courses.getId());

        partialUpdatedCourses.courseName(UPDATED_COURSE_NAME).creditHour(UPDATED_CREDIT_HOUR);

        restCoursesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCourses.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCourses))
            )
            .andExpect(status().isOk());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeUpdate);
        Courses testCourses = coursesList.get(coursesList.size() - 1);
        assertThat(testCourses.getCourseName()).isEqualTo(UPDATED_COURSE_NAME);
        assertThat(testCourses.getCreditHour()).isEqualTo(UPDATED_CREDIT_HOUR);
    }

    @Test
    @Transactional
    void patchNonExistingCourses() throws Exception {
        int databaseSizeBeforeUpdate = coursesRepository.findAll().size();
        courses.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCoursesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, courses.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(courses))
            )
            .andExpect(status().isBadRequest());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCourses() throws Exception {
        int databaseSizeBeforeUpdate = coursesRepository.findAll().size();
        courses.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCoursesMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(courses))
            )
            .andExpect(status().isBadRequest());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCourses() throws Exception {
        int databaseSizeBeforeUpdate = coursesRepository.findAll().size();
        courses.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCoursesMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(courses)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Courses in the database
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCourses() throws Exception {
        // Initialize the database
        coursesRepository.saveAndFlush(courses);

        int databaseSizeBeforeDelete = coursesRepository.findAll().size();

        // Delete the courses
        restCoursesMockMvc
            .perform(delete(ENTITY_API_URL_ID, courses.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Courses> coursesList = coursesRepository.findAll();
        assertThat(coursesList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
