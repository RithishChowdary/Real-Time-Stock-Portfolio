package com.major.stockportfolio.controller;

import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import java.nio.file.*;

@RestController
@RequestMapping("/api/research")

public class ResearchFileController
 {
    @GetMapping("/download/{fileName}")
public ResponseEntity<Resource> download(
        @PathVariable String fileName)
        throws Exception {

    Path path =
            Paths.get("uploads/research/")
                    .resolve(fileName);

    Resource resource =
            new UrlResource(path.toUri());

    return ResponseEntity.ok()
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename="
                            + fileName)
            .body(resource);
}
}
