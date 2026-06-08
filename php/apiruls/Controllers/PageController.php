<?php

require_once dirname(__DIR__) . '/Database.php';

class PageController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        $stmt = $this->db->query("
            SELECT p.id, p.name, p.description, p.template, s.key as slug 
            FROM pages p
            LEFT JOIN slugs s ON s.reference_id = p.id AND s.reference_type = 'Botble\\\\Page\\\\Models\\\\Page'
            WHERE p.status = 'published'
        ");
        $pages = $stmt->fetchAll();

        echo json_encode([
            'error' => false,
            'data' => $pages,
            'message' => 'Success'
        ]);
    }

    public function getBySlug($slug) {
        $stmt = $this->db->prepare("
            SELECT p.id, p.name, p.content, p.description, p.template, p.image 
            FROM pages p
            JOIN slugs s ON s.reference_id = p.id AND s.reference_type = 'Botble\\\\Page\\\\Models\\\\Page'
            WHERE s.key = ? AND p.status = 'published' LIMIT 1
        ");
        $stmt->execute([$slug]);
        $page = $stmt->fetch();

        if (!$page) {
            http_response_code(404);
            echo json_encode(['error' => true, 'data' => null, 'message' => 'Page not found']);
            return;
        }

        echo json_encode([
            'error' => false,
            'data' => $page,
            'message' => 'Success'
        ]);
    }
}
