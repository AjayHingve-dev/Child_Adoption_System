package com.backend.security;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.backend.entity.SocialWorker;
import com.backend.entity.User;
import com.backend.repository.SocialWorkerRepository;
import com.backend.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SocialWorkerRepository socialWorkerRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        String cleanEmail = email.toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(cleanEmail);
        if (userOpt.isPresent()) {
            return UserPrincipal.create(userOpt.get());
        }

        Optional<SocialWorker> workerOpt = socialWorkerRepository.findByEmail(cleanEmail);
        if (workerOpt.isPresent()) {
            return UserPrincipal.create(workerOpt.get());
        }

        throw new UsernameNotFoundException("User/SocialWorker not found with email: " + email);
    }
}
