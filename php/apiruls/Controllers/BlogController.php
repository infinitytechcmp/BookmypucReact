<?php

require_once dirname(__DIR__) . '/Database.php';

class BlogController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getPosts() {
        $stmt = $this->db->query("
            SELECT p.id, p.name, p.description, p.image, p.created_at, s.key as slug
            FROM posts p
            LEFT JOIN slugs s ON s.reference_id = p.id AND s.reference_type = 'Botble\\\\Blog\\\\Models\\\\Post'
            WHERE p.status = 'published' ORDER BY p.created_at DESC
        ");
        
        echo json_encode(['error' => false, 'data' => $stmt->fetchAll(), 'message' => 'Success']);
    }

    public function getPostBySlug($slug) {
        $stmt = $this->db->prepare("
            SELECT p.*
            FROM posts p
            JOIN slugs s ON s.reference_id = p.id AND s.reference_type = 'Botble\\\\Blog\\\\Models\\\\Post'
            WHERE s.key = ? AND p.status = 'published' LIMIT 1
        ");
        $stmt->execute([$slug]);
        $post = $stmt->fetch();

        if (!$post) {
            http_response_code(404);
            echo json_encode(['error' => true, 'data' => null, 'message' => 'Post not found']);
            return;
        }

        echo json_encode(['error' => false, 'data' => $post, 'message' => 'Success']);
    }

    public function getCategories() {
        $stmt = $this->db->query("
            SELECT c.id, c.name, c.description, s.key as slug
            FROM categories c
            LEFT JOIN slugs s ON s.reference_id = c.id AND s.reference_type = 'Botble\\\\Blog\\\\Models\\\\Category'
            WHERE c.status = 'published'
        ");
        echo json_encode(['error' => false, 'data' => $stmt->fetchAll(), 'message' => 'Success']);
    }

    public function getCategoryBySlug($slug) {
        // Similar implementation for Category
        $stmt = $this->db->prepare("
            SELECT c.*
            FROM categories c
            JOIN slugs s ON s.reference_id = c.id AND s.reference_type = 'Botble\\\\Blog\\\\Models\\\\Category'
            WHERE s.key = ? AND c.status = 'published' LIMIT 1
        ");
        $stmt->execute([$slug]);
        $category = $stmt->fetch();
        if ($category) {
            echo json_encode(['error' => false, 'data' => $category, 'message' => 'Success']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => true, 'data' => null, 'message' => 'Category not found']);
        }
    }

    public function getTags() {
        $stmt = $this->db->query("
            SELECT t.id, t.name, s.key as slug
            FROM tags t
            LEFT JOIN slugs s ON s.reference_id = t.id AND s.reference_type = 'Botble\\\\Blog\\\\Models\\\\Tag'
            WHERE t.status = 'published'
        ");
        echo json_encode(['error' => false, 'data' => $stmt->fetchAll(), 'message' => 'Success']);
    }

    public function getTagBySlug($slug) {
        $stmt = $this->db->prepare("
            SELECT t.*
            FROM tags t
            JOIN slugs s ON s.reference_id = t.id AND s.reference_type = 'Botble\\\\Blog\\\\Models\\\\Tag'
            WHERE s.key = ? AND t.status = 'published' LIMIT 1
        ");
        $stmt->execute([$slug]);
        $tag = $stmt->fetch();
        if ($tag) {
            echo json_encode(['error' => false, 'data' => $tag, 'message' => 'Success']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => true, 'data' => null, 'message' => 'Tag not found']);
        }
    }
}
