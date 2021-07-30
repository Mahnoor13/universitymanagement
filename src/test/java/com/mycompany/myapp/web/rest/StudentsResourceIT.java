package com.mycompany.myapp.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import com.mycompany.myapp.IntegrationTest;
import com.mycompany.myapp.domain.Students;
import com.mycompany.myapp.repository.StudentsRepository;
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
 * Integration tests for the {@link StudentsResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class StudentsResourceIT {

    private static final String DEFAULT_FIRST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FIRST_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_LAST_NAME = "AAAAAAAAAA";
    private static final String UPDATED_LAST_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_EMAIL = "AAAAAAAAAA";
    private static final String UPDATED_EMAIL = "BBBBBBBBBB";

    private static final String DEFAULT_PHONE_NO = "AAAAAAAAAA";
    private static final String UPDATED_PHONE_NO = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/students";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private StudentsRepository studentsRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restStudentsMockMvc;

    private Students students;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Students createEntity(EntityManager em) {
        Students students = new Students()
            .firstName(DEFAULT_FIRST_NAME)
            .lastName(DEFAULT_LAST_NAME)
            .email(DEFAULT_EMAIL)
            .phoneNo(DEFAULT_PHONE_NO);
        return students;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Students createUpdatedEntity(EntityManager em) {
        Students students = new Students()
            .firstName(UPDATED_FIRST_NAME)
            .lastName(UPDATED_LAST_NAME)
            .email(UPDATED_EMAIL)
            .phoneNo(UPDATED_PHONE_NO);
        return students;
    }

    @BeforeEach
    public void initTest() {
        students = createEntity(em);
    }

    @Test
    @Transactional
    void createStudents() throws Exception {
        int databaseSizeBeforeCreate = studentsRepository.findAll().size();
        // Create the Students
        restStudentsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(students)))
            .andExpect(status().isCreated());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeCreate + 1);
        Students testStudents = studentsList.get(studentsList.size() - 1);
        assertThat(testStudents.getFirstName()).isEqualTo(DEFAULT_FIRST_NAME);
        assertThat(testStudents.getLastName()).isEqualTo(DEFAULT_LAST_NAME);
        assertThat(testStudents.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(testStudents.getPhoneNo()).isEqualTo(DEFAULT_PHONE_NO);
    }

    @Test
    @Transactional
    void createStudentsWithExistingId() throws Exception {
        // Create the Students with an existing ID
        students.setId(1L);

        int databaseSizeBeforeCreate = studentsRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restStudentsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(students)))
            .andExpect(status().isBadRequest());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkEmailIsRequired() throws Exception {
        int databaseSizeBeforeTest = studentsRepository.findAll().size();
        // set the field null
        students.setEmail(null);

        // Create the Students, which fails.

        restStudentsMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(students)))
            .andExpect(status().isBadRequest());

        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllStudents() throws Exception {
        // Initialize the database
        studentsRepository.saveAndFlush(students);

        // Get all the studentsList
        restStudentsMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(students.getId().intValue())))
            .andExpect(jsonPath("$.[*].firstName").value(hasItem(DEFAULT_FIRST_NAME)))
            .andExpect(jsonPath("$.[*].lastName").value(hasItem(DEFAULT_LAST_NAME)))
            .andExpect(jsonPath("$.[*].email").value(hasItem(DEFAULT_EMAIL)))
            .andExpect(jsonPath("$.[*].phoneNo").value(hasItem(DEFAULT_PHONE_NO)));
    }

    @Test
    @Transactional
    void getStudents() throws Exception {
        // Initialize the database
        studentsRepository.saveAndFlush(students);

        // Get the students
        restStudentsMockMvc
            .perform(get(ENTITY_API_URL_ID, students.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(students.getId().intValue()))
            .andExpect(jsonPath("$.firstName").value(DEFAULT_FIRST_NAME))
            .andExpect(jsonPath("$.lastName").value(DEFAULT_LAST_NAME))
            .andExpect(jsonPath("$.email").value(DEFAULT_EMAIL))
            .andExpect(jsonPath("$.phoneNo").value(DEFAULT_PHONE_NO));
    }

    @Test
    @Transactional
    void getNonExistingStudents() throws Exception {
        // Get the students
        restStudentsMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewStudents() throws Exception {
        // Initialize the database
        studentsRepository.saveAndFlush(students);

        int databaseSizeBeforeUpdate = studentsRepository.findAll().size();

        // Update the students
        Students updatedStudents = studentsRepository.findById(students.getId()).get();
        // Disconnect from session so that the updates on updatedStudents are not directly saved in db
        em.detach(updatedStudents);
        updatedStudents.firstName(UPDATED_FIRST_NAME).lastName(UPDATED_LAST_NAME).email(UPDATED_EMAIL).phoneNo(UPDATED_PHONE_NO);

        restStudentsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedStudents.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedStudents))
            )
            .andExpect(status().isOk());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeUpdate);
        Students testStudents = studentsList.get(studentsList.size() - 1);
        assertThat(testStudents.getFirstName()).isEqualTo(UPDATED_FIRST_NAME);
        assertThat(testStudents.getLastName()).isEqualTo(UPDATED_LAST_NAME);
        assertThat(testStudents.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(testStudents.getPhoneNo()).isEqualTo(UPDATED_PHONE_NO);
    }

    @Test
    @Transactional
    void putNonExistingStudents() throws Exception {
        int databaseSizeBeforeUpdate = studentsRepository.findAll().size();
        students.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStudentsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, students.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(students))
            )
            .andExpect(status().isBadRequest());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchStudents() throws Exception {
        int databaseSizeBeforeUpdate = studentsRepository.findAll().size();
        students.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentsMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(students))
            )
            .andExpect(status().isBadRequest());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamStudents() throws Exception {
        int databaseSizeBeforeUpdate = studentsRepository.findAll().size();
        students.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentsMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(students)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateStudentsWithPatch() throws Exception {
        // Initialize the database
        studentsRepository.saveAndFlush(students);

        int databaseSizeBeforeUpdate = studentsRepository.findAll().size();

        // Update the students using partial update
        Students partialUpdatedStudents = new Students();
        partialUpdatedStudents.setId(students.getId());

        restStudentsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedStudents.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedStudents))
            )
            .andExpect(status().isOk());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeUpdate);
        Students testStudents = studentsList.get(studentsList.size() - 1);
        assertThat(testStudents.getFirstName()).isEqualTo(DEFAULT_FIRST_NAME);
        assertThat(testStudents.getLastName()).isEqualTo(DEFAULT_LAST_NAME);
        assertThat(testStudents.getEmail()).isEqualTo(DEFAULT_EMAIL);
        assertThat(testStudents.getPhoneNo()).isEqualTo(DEFAULT_PHONE_NO);
    }

    @Test
    @Transactional
    void fullUpdateStudentsWithPatch() throws Exception {
        // Initialize the database
        studentsRepository.saveAndFlush(students);

        int databaseSizeBeforeUpdate = studentsRepository.findAll().size();

        // Update the students using partial update
        Students partialUpdatedStudents = new Students();
        partialUpdatedStudents.setId(students.getId());

        partialUpdatedStudents.firstName(UPDATED_FIRST_NAME).lastName(UPDATED_LAST_NAME).email(UPDATED_EMAIL).phoneNo(UPDATED_PHONE_NO);

        restStudentsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedStudents.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedStudents))
            )
            .andExpect(status().isOk());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeUpdate);
        Students testStudents = studentsList.get(studentsList.size() - 1);
        assertThat(testStudents.getFirstName()).isEqualTo(UPDATED_FIRST_NAME);
        assertThat(testStudents.getLastName()).isEqualTo(UPDATED_LAST_NAME);
        assertThat(testStudents.getEmail()).isEqualTo(UPDATED_EMAIL);
        assertThat(testStudents.getPhoneNo()).isEqualTo(UPDATED_PHONE_NO);
    }

    @Test
    @Transactional
    void patchNonExistingStudents() throws Exception {
        int databaseSizeBeforeUpdate = studentsRepository.findAll().size();
        students.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restStudentsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, students.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(students))
            )
            .andExpect(status().isBadRequest());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchStudents() throws Exception {
        int databaseSizeBeforeUpdate = studentsRepository.findAll().size();
        students.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentsMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(students))
            )
            .andExpect(status().isBadRequest());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamStudents() throws Exception {
        int databaseSizeBeforeUpdate = studentsRepository.findAll().size();
        students.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restStudentsMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(students)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Students in the database
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteStudents() throws Exception {
        // Initialize the database
        studentsRepository.saveAndFlush(students);

        int databaseSizeBeforeDelete = studentsRepository.findAll().size();

        // Delete the students
        restStudentsMockMvc
            .perform(delete(ENTITY_API_URL_ID, students.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Students> studentsList = studentsRepository.findAll();
        assertThat(studentsList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
