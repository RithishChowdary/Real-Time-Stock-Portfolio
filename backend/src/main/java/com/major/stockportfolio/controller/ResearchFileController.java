package com.major.stockportfolio.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import com.major.stockportfolio.exception.BadRequestException;
import com.major.stockportfolio.exception.ResourceNotFoundException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/research")
public class ResearchFileController {

    @Value("${app.upload.research-dir:uploads/research}")
    private String researchUploadDir;

    @GetMapping("/download/{fileName:.+}")
    public ResponseEntity<Resource> download(
            @PathVariable String fileName
    ) throws IOException {

        String safeFileName =
                Paths.get(fileName)
                        .getFileName()
                        .toString();

        Path uploadRoot =
                Paths.get(researchUploadDir)
                        .toAbsolutePath()
                        .normalize();

        Path filePath =
                uploadRoot
                        .resolve(safeFileName)
                        .normalize();

        if (!filePath.startsWith(uploadRoot)) {
            throw new BadRequestException("Invalid research file name");
        }

        if (!Files.exists(filePath)
                || !Files.isRegularFile(filePath)
                || !Files.isReadable(filePath)) {
            throw new ResourceNotFoundException("Research PDF not found. Please upload the research report again.");
        }

        Resource resource =
                new FileSystemResource(
                        filePath
                );

        String contentType =
                Files.probeContentType(filePath);

        if (contentType == null) {
            contentType =
                    MediaType.APPLICATION_PDF_VALUE;
        }

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .contentLength(
                        Files.size(filePath)
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition
                                .attachment()
                                .filename(safeFileName)
                                .build()
                                .toString()
                )
                .body(resource);
    }
}
