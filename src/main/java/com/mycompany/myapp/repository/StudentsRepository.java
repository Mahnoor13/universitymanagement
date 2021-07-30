package com.mycompany.myapp.repository;

import com.mycompany.myapp.domain.Students;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;

/**
 * Spring Data SQL repository for the Students entity.
 */
@SuppressWarnings("unused")
@Repository
public interface StudentsRepository extends JpaRepository<Students, Long> {}
