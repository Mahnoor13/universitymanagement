package com.mycompany.myapp.service.impl;

import com.mycompany.myapp.domain.Courses;
import com.mycompany.myapp.repository.CoursesRepository;
import com.mycompany.myapp.service.CoursesService;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service Implementation for managing {@link Courses}.
 */
@Service
@Transactional
public class CoursesServiceImpl implements CoursesService {

    private final Logger log = LoggerFactory.getLogger(CoursesServiceImpl.class);

    private final CoursesRepository coursesRepository;

    public CoursesServiceImpl(CoursesRepository coursesRepository) {
        this.coursesRepository = coursesRepository;
    }

    @Override
    public Courses save(Courses courses) {
        log.debug("Request to save Courses : {}", courses);
        return coursesRepository.save(courses);
    }

    @Override
    public Optional<Courses> partialUpdate(Courses courses) {
        log.debug("Request to partially update Courses : {}", courses);

        return coursesRepository
            .findById(courses.getId())
            .map(
                existingCourses -> {
                    if (courses.getCourseName() != null) {
                        existingCourses.setCourseName(courses.getCourseName());
                    }
                    if (courses.getCreditHour() != null) {
                        existingCourses.setCreditHour(courses.getCreditHour());
                    }

                    return existingCourses;
                }
            )
            .map(coursesRepository::save);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Courses> findAll(Pageable pageable) {
        log.debug("Request to get all Courses");
        return coursesRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Courses> findOne(Long id) {
        log.debug("Request to get Courses : {}", id);
        return coursesRepository.findById(id);
    }

    @Override
    public void delete(Long id) {
        log.debug("Request to delete Courses : {}", id);
        coursesRepository.deleteById(id);
    }

    public Courses create(Courses courses) {
        courses.setCourseName(courses.getCourseName());
        courses.setCreditHour(courses.getCreditHour());

    }
}
