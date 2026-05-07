package com.skillbank.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReferralCodeService {

    private final UserRepository userRepository;

    public String normalize(String code) {
        if (code == null) return null;
        String normalized = code.trim().toUpperCase(Locale.ROOT);
        return normalized.isBlank() ? null : normalized;
    }

    public String generateForName(String name) {
        String source = name != null ? name : "";
        String prefix = source.replaceAll("[^a-zA-Z]", "").toUpperCase(Locale.ROOT);
        if (prefix.length() > 4) prefix = prefix.substring(0, 4);
        if (prefix.isEmpty()) prefix = "USER";

        String code = newCode(prefix);
        while (userRepository.findByReferralCode(code).isPresent()) {
            code = newCode(prefix);
        }
        return code;
    }

    private String newCode(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
    }
}
