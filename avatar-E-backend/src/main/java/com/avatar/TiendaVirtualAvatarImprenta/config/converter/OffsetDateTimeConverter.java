package com.avatar.TiendaVirtualAvatarImprenta.config.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.sql.Timestamp;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;

@Converter(autoApply = true)
public class OffsetDateTimeConverter implements AttributeConverter<OffsetDateTime, Timestamp> {

    @Override
    public Timestamp convertToDatabaseColumn(OffsetDateTime offsetDateTime) {
        return offsetDateTime != null ? Timestamp.valueOf(offsetDateTime.toLocalDateTime()) : null;
    }

    @Override
    public OffsetDateTime convertToEntityAttribute(Timestamp timestamp) {
        return timestamp != null
                ? timestamp.toLocalDateTime().atZone(ZoneId.of("America/Santiago")).toOffsetDateTime()
                : null;

    }
}
