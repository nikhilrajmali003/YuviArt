package com.yuviart.controller;

import com.yuviart.model.Artwork;
import com.yuviart.service.ArtworkService;
import com.yuviart.service.FileStorageService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/artworks")
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
}) // ✅ Allow only your frontend ports
public class ArtworkController {

    private final ArtworkService artworkService;
    private final FileStorageService fileStorageService;

    public ArtworkController(ArtworkService artworkService, FileStorageService fileStorageService) {
        this.artworkService = artworkService;
        this.fileStorageService = fileStorageService;
    }

    // 🖼️ Get all artworks
    @GetMapping
    public ResponseEntity<List<Artwork>> getAllArtworks() {
        return ResponseEntity.ok(artworkService.getAvailableArtworks());
    }

    // 🖼️ Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<Artwork> getArtworkById(@PathVariable Long id) {
        return ResponseEntity.ok(artworkService.getArtworkById(id));
    }

    // 🏷️ Get by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Artwork>> getArtworksByCategory(@PathVariable String category) {
        return ResponseEntity.ok(artworkService.getArtworksByCategory(category));
    }

    // ➕ Create Artwork (without image)
    @PostMapping
    public ResponseEntity<Artwork> createArtwork(@RequestBody Artwork artwork) {
        Artwork created = artworkService.createArtwork(artwork);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // 🖼️ Upload artwork + image
    @PostMapping("/upload")
    public ResponseEntity<Artwork> createArtworkWithImage(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("category") String category,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "rating", defaultValue = "5") Integer rating,
            @RequestParam(value = "stockQuantity", defaultValue = "1") Integer stockQuantity,
            @RequestParam("image") MultipartFile image) {

        try {
            // Save image to uploads folder
            String filename = fileStorageService.storeFile(image);
            String imageUrl = "/api/upload/images/" + filename;

            Artwork artwork = new Artwork();
            artwork.setTitle(title);
            artwork.setDescription(description);
            artwork.setCategory(category);
            artwork.setPrice(price.doubleValue());
            artwork.setImageUrl(imageUrl);
            artwork.setRating(rating.doubleValue());
            artwork.setStockQuantity(stockQuantity);
            artwork.setAvailable(true);

            Artwork created = artworkService.createArtwork(artwork);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✏️ Update artwork
    @PutMapping("/{id}")
    public ResponseEntity<Artwork> updateArtwork(@PathVariable Long id, @RequestBody Artwork artwork) {
        return ResponseEntity.ok(artworkService.updateArtwork(id, artwork));
    }

    // ❌ Delete artwork
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteArtwork(@PathVariable Long id) {
        Artwork artwork = artworkService.getArtworkById(id);

        // Delete file if it exists
        if (artwork.getImageUrl() != null && artwork.getImageUrl().startsWith("/api/upload/")) {
            String filename = artwork.getImageUrl().substring(artwork.getImageUrl().lastIndexOf("/") + 1);
            fileStorageService.deleteFile(filename);
        }

        artworkService.deleteArtwork(id);
        return ResponseEntity.noContent().build();
    }
}
