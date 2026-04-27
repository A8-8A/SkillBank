package com.skillbank.transaction;

import com.skillbank.exception.InsufficientBalanceException;
import com.skillbank.session.Session;
import com.skillbank.session.SessionRepository;
import com.skillbank.session.SessionStatus;
import com.skillbank.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class EscrowService {

    private static final BigDecimal MIN_BALANCE = BigDecimal.ZERO;

    private final TimeTransactionRepository transactionRepo;
    private final SessionRepository sessionRepo;

    @Transactional(readOnly = true)
    public BigDecimal getBalance(Long userId) {
        BigDecimal credits = transactionRepo.sumCreditsForUser(userId);
        BigDecimal debits = transactionRepo.sumDebitsForUser(userId);
        return credits.subtract(debits);
    }

    @Transactional
    public void holdEscrow(Session session) {
        BigDecimal hours = minutesToHours(session.getDurationMinutes());
        BigDecimal currentBalance = getBalance(session.getLearner().getId());

        if (currentBalance.compareTo(hours) < 0) {
            throw new InsufficientBalanceException(
                "Insufficient credits. You have " + currentBalance + " hr(s) but this session costs " + hours + " hr(s).");
        }

        transactionRepo.save(TimeTransaction.builder()
                .session(session)
                .fromUser(session.getLearner())
                .toUser(null)
                .hours(hours)
                .type(TransactionType.ESCROW_HOLD)
                .build());
    }

    @Transactional
    public void releaseToTeacher(Session session) {
        if (transactionRepo.existsBySessionIdAndType(session.getId(), TransactionType.ESCROW_RELEASE)) {
            return;
        }

        BigDecimal hours = minutesToHours(session.getDurationMinutes());

        transactionRepo.save(TimeTransaction.builder()
                .session(session)
                .fromUser(null)
                .toUser(session.getTeacher())
                .hours(hours)
                .type(TransactionType.ESCROW_RELEASE)
                .build());

        session.setStatus(SessionStatus.COMPLETED);
        sessionRepo.save(session);
    }

    @Transactional
    public void refundToLearner(Session session) {
        if (transactionRepo.existsBySessionIdAndType(session.getId(), TransactionType.ESCROW_REFUND)) {
            return;
        }

        BigDecimal hours = minutesToHours(session.getDurationMinutes());

        transactionRepo.save(TimeTransaction.builder()
                .session(session)
                .fromUser(null)
                .toUser(session.getLearner())
                .hours(hours)
                .type(TransactionType.ESCROW_REFUND)
                .build());
    }

    @Transactional
    public void seedNewUser(User user) {
        transactionRepo.save(TimeTransaction.builder()
                .fromUser(null)
                .toUser(user)
                .session(null)
                .hours(new BigDecimal("3.00"))
                .type(TransactionType.PURCHASE)
                .build());
    }

    @Transactional
    public void purchaseCredits(User user, BigDecimal hours) {
        if (hours.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Purchase amount must be positive");
        }

        transactionRepo.save(TimeTransaction.builder()
                .fromUser(null)
                .toUser(user)
                .session(null)
                .hours(hours.setScale(2, RoundingMode.HALF_UP))
                .type(TransactionType.PURCHASE)
                .build());
    }

    @Transactional
    public void deductCredits(User user, BigDecimal hours) {
        if (hours.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deduction amount must be positive");
        }

        BigDecimal currentBalance = getBalance(user.getId());
        if (currentBalance.compareTo(hours) < 0) {
            throw new InsufficientBalanceException(
                "Insufficient credits. User has " + currentBalance + " but tried to deduct " + hours);
        }

        transactionRepo.save(TimeTransaction.builder()
                .fromUser(user)
                .toUser(null)
                .session(null)
                .hours(hours.setScale(2, RoundingMode.HALF_UP))
                .type(TransactionType.REDEMPTION)
                .build());
    }

    private BigDecimal minutesToHours(int minutes) {
        return new BigDecimal(minutes)
                .divide(new BigDecimal("60"), 2, RoundingMode.HALF_UP);
    }
}
