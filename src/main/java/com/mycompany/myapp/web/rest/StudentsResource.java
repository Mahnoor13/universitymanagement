package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.domain.Students;
import com.mycompany.myapp.domain.User;
import com.mycompany.myapp.dto.StudentDto;
import com.mycompany.myapp.repository.StudentsRepository;
import com.mycompany.myapp.security.AuthoritiesConstants;
import com.mycompany.myapp.service.StudentsService;
import com.mycompany.myapp.service.UserService;
import com.mycompany.myapp.service.dto.AdminUserDTO;
import com.mycompany.myapp.service.mapper.UserMapper;
import com.mycompany.myapp.web.rest.errors.BadRequestAlertException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import liquibase.pro.packaged.S;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;

/**
 * REST controller for managing {@link com.mycompany.myapp.domain.Students}.
 */
@RestController
@RequestMapping("/api")
public class StudentsResource {

    private final Logger log = LoggerFactory.getLogger(StudentsResource.class);

    private static final String ENTITY_NAME = "students";

    @Value("${jhipster.clientApp.name}")
    private String applicationName;

    private final StudentsService studentsService;

    private final StudentsRepository studentsRepository;

    private final UserService userService;

    private final UserMapper userMapper;

    public StudentsResource(StudentsService studentsService, StudentsRepository studentsRepository, UserService userService, UserMapper userMapper) {
        this.studentsService = studentsService;
        this.studentsRepository = studentsRepository;
        this.userService = userService;
        this.userMapper = userMapper;
    }

    /**
     * {@code POST  /students} : Create a new students.
     *
     * @param students the students to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new students, or with status {@code 400 (Bad Request)} if the students has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("/students")
    public ResponseEntity<Students> createStudents(@Valid @RequestBody Students students) throws URISyntaxException {
        log.debug("REST request to save Students : {}", students);
        if (students.getId() != null) {
            throw new BadRequestAlertException("A new students cannot already have an ID", ENTITY_NAME, "idexists");
        }
        Students result = studentsService.save(students);
        return ResponseEntity
            .created(new URI("/api/students/" + result.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, result.getId().toString()))
            .body(result);
    }

    /**
     * {@code PUT  /students/:id} : Updates an existing students.
     *
     * @param id the id of the students to save.
     * @param students the students to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated students,
     * or with status {@code 400 (Bad Request)} if the students is not valid,
     * or with status {@code 500 (Internal Server Error)} if the students couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/students/{id}")
    public ResponseEntity<Students> updateStudents(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody Students students
    ) throws URISyntaxException {
        log.debug("REST request to update Students : {}, {}", id, students);
        if (students.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, students.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!studentsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Students result = studentsService.save(students);
        return ResponseEntity
            .ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, students.getId().toString()))
            .body(result);
    }

    /**
     * {@code PATCH  /students/:id} : Partial updates given fields of an existing students, field will ignore if it is null
     *
     * @param id the id of the students to save.
     * @param students the students to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated students,
     * or with status {@code 400 (Bad Request)} if the students is not valid,
     * or with status {@code 404 (Not Found)} if the students is not found,
     * or with status {@code 500 (Internal Server Error)} if the students couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/students/{id}", consumes = "application/merge-patch+json")
    public ResponseEntity<Students> partialUpdateStudents(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody Students students
    ) throws URISyntaxException {
        log.debug("REST request to partial update Students partially : {}, {}", id, students);
        if (students.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, students.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!studentsRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<Students> result = studentsService.partialUpdate(students);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, students.getId().toString())
        );
    }

    /**
     * {@code GET  /students} : get all the students.
     *
     * @param pageable the pagination information.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of students in body.
     */
    @GetMapping("/students")
    public ResponseEntity<List<Students>> getAllStudents(Pageable pageable) {
        log.debug("REST request to get a page of Students");
        Page<Students> page = studentsService.findAll(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /students/:id} : get the "id" students.
     *
     * @param id the id of the students to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the students, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/students/{id}")
    public ResponseEntity<Students> getStudents(@PathVariable Long id) {
        log.debug("REST request to get Students : {}", id);
        Optional<Students> students = studentsService.findOne(id);
        return ResponseUtil.wrapOrNotFound(students);
    }

    /**
     * {@code DELETE  /students/:id} : delete the "id" students.
     *
     * @param id the id of the students to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/students/{id}")
    public ResponseEntity<Void> deleteStudents(@PathVariable Long id) {
        log.debug("REST request to delete Students : {}", id);
        studentsService.delete(id);
        return ResponseEntity
            .noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    @PostMapping("/students/create")
    public ResponseEntity<Students> createStudent(@Valid @RequestBody StudentDto students)
    {
        AdminUserDTO adminUserDTO = userMapper.toAdminUserDto(students);
        User userForStudent = userService.createUserForStudent(adminUserDTO, students.getPassword());
        Students result = studentsService.createStudent(userForStudent,students.getPhone());
        return new ResponseEntity<Students>( result, HttpStatus.OK);


    }
      @GetMapping("/students/check")
      @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.STUDENT + "\")")
    public String checkStudent()
      {
          return "helloworld";

      }
}
