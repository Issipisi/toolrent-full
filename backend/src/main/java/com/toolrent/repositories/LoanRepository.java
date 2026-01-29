package com.toolrent.repositories;

import com.toolrent.dto.LoanActiveDTO;
import com.toolrent.entities.LoanEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface LoanRepository extends JpaRepository<LoanEntity, Long> {

    // Préstamos activos (sin devolución) en rango de fecha de préstamo
    @Query("""
        SELECT new com.toolrent.dto.LoanActiveDTO(
               l.id,
               c.name,
               tg.name,
               l.loanDate,
               l.dueDate,
               l.returnDate,
               l.fineAmount,
               l.damageCharge)
        FROM LoanEntity l
        JOIN l.customer c
        JOIN l.toolUnit tu
        JOIN tu.toolGroup tg
        WHERE l.returnDate IS NULL
          AND l.loanDate BETWEEN :from AND :to
        ORDER BY l.dueDate ASC
    """)
    List<LoanActiveDTO> findActiveLoansInRange(@Param("from") LocalDateTime from,
                                               @Param("to") LocalDateTime to);

    // Ranking de grupos más prestados en un rango de fechas (nativo)
    @Query("""
    SELECT new map(
        tg.id as toolGroupId,
        tg.name as toolGroupName,
        tg.category as category,
        COUNT(l.id) as total
    )
    FROM LoanEntity l
    JOIN l.toolUnit tu
    JOIN tu.toolGroup tg
    WHERE l.loanDate BETWEEN :from AND :to
    GROUP BY tg.id, tg.name, tg.category
    ORDER BY COUNT(l.id) DESC
""")
    List<Map<String, Object>> countLoansByToolGroupInRange(@Param("from") LocalDateTime from,
                                                           @Param("to") LocalDateTime to);

    // Préstamos devueltos CON deudas (multa o daño)
    @Query("""
        SELECT new com.toolrent.dto.LoanActiveDTO(
               l.id,
               c.name,
               tg.name,
               l.loanDate,
               l.dueDate,
               l.returnDate,
               l.fineAmount,
               l.damageCharge)
        FROM LoanEntity l
        JOIN l.customer c
        JOIN l.toolUnit tu
        JOIN tu.toolGroup tg
        WHERE l.returnDate IS NOT NULL
          AND (l.fineAmount > 0 OR l.damageCharge > 0)
        ORDER BY l.returnDate DESC
    """)
    List<LoanActiveDTO> findReturnedWithDebts();

    // Préstamos pendientes de pago (mismo filtro que arriba, puedes elegir cuál usar)
    @Query("""
        SELECT new com.toolrent.dto.LoanActiveDTO(
               l.id,
               c.name,
               tg.name,
               l.loanDate,
               l.dueDate,
               l.returnDate,
               l.fineAmount,
               l.damageCharge)
        FROM LoanEntity l
        JOIN l.customer c
        JOIN l.toolUnit tu
        JOIN tu.toolGroup tg
        WHERE l.returnDate IS NOT NULL
          AND (l.fineAmount > 0 OR l.damageCharge > 0)
        ORDER BY l.returnDate DESC
    """)
    List<LoanActiveDTO> findPendingPayment();

    // Consulta el último préstamo devuelto de una unidad
    @Query("""
    SELECT l
    FROM LoanEntity l
    WHERE l.toolUnit.id = :unitId
      AND l.returnDate IS NOT NULL
    ORDER BY l.returnDate DESC
    LIMIT 1
""")
    Optional<LoanEntity> findTopByToolUnitIdAndReturnDateIsNotNullOrderByReturnDateDesc(@Param("unitId") Long unitId);

    /* ---------- Métodos de validación de negocio ---------- */

    boolean existsByCustomerIdAndReturnDateIsNullAndDueDateBefore(Long customerId, LocalDateTime now);

    boolean existsByCustomerIdAndFineAmountGreaterThanAndReturnDateIsNotNull(Long customerId, double amount);

    boolean existsByCustomerIdAndDamageChargeGreaterThanAndReturnDateIsNotNull(Long customerId, double amount);

    long countByCustomerIdAndReturnDateIsNull(Long customerId);

    boolean existsByCustomerIdAndToolUnitToolGroupIdAndReturnDateIsNull(Long customerId, Long toolGroupId);
}