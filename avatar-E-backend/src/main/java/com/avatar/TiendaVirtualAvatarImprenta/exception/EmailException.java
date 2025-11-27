package com.avatar.TiendaVirtualAvatarImprenta.exception;

import com.avatar.TiendaVirtualAvatarImprenta.enums.EmailErrorType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class EmailException extends RuntimeException {
    private  final  String email;
    private final EmailErrorType errorType;

    public EmailException(String message, String email, EmailErrorType errorType) {
        super(message);
        this.email = email;
        this.errorType = errorType;
    }

    public EmailException(String message, String email, EmailErrorType errorType, Throwable cause) {
        super(message, cause);
        this.email = email;
        this.errorType = errorType;
    }

}
