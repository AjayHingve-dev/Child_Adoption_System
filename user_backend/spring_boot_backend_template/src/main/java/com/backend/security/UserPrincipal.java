package com.backend.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.backend.entity.SocialWorker;
import com.backend.entity.User;
import com.backend.entity.UserStatus;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Long id;
    private String email;
    private String password;
    private String firstName;
    private String lastName;
    private String phone;
    private UserStatus status;
    private Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_PARENT");

        return new UserPrincipal(
                user.getUserId(),
                user.getEmail(),
                user.getPassword(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getStatus(),
                Collections.singletonList(authority)
        );
    }

    public static UserPrincipal create(SocialWorker worker) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_SOCIAL_WORKER");

        return new UserPrincipal(
                worker.getSocialWorkerId(),
                worker.getEmail(),
                worker.getPassword(),
                worker.getFirstName(),
                worker.getLastName(),
                worker.getPhone(),
                UserStatus.ACTIVE,
                Collections.singletonList(authority)
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != UserStatus.INACTIVE;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return status != UserStatus.INACTIVE;
    }
}
