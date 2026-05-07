package com.skillbank.transaction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface TimeTransactionRepository extends JpaRepository<TimeTransaction, Long> {

    List<TimeTransaction> findByToUserIdOrFromUserIdOrderByCreatedAtDesc(Long toUserId, Long fromUserId);

    @Query("""
        SELECT COALESCE(SUM(t.hours), 0) FROM TimeTransaction t
        WHERE t.toUser.id = :userId
          AND t.type IN ('ESCROW_RELEASE', 'ESCROW_REFUND', 'PURCHASE')
        """)
    BigDecimal sumCreditsForUser(@Param("userId") Long userId);

    @Query("""
        SELECT COALESCE(SUM(t.hours), 0) FROM TimeTransaction t
        WHERE t.fromUser.id = :userId
          AND t.type IN ('ESCROW_HOLD', 'REDEMPTION')
        """)
    BigDecimal sumDebitsForUser(@Param("userId") Long userId);

    boolean existsBySessionIdAndType(Long sessionId, TransactionType type);

    @Modifying
    @Query("UPDATE TimeTransaction t SET t.fromUser = null WHERE t.fromUser.id = :userId")
    void nullifyFromUser(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE TimeTransaction t SET t.toUser = null WHERE t.toUser.id = :userId")
    void nullifyToUser(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE TimeTransaction t SET t.session = null WHERE t.session.id IN :sessionIds")
    void nullifySessionBySessionIdIn(@Param("sessionIds") List<Long> sessionIds);
}
