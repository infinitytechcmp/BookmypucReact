<?php

require_once dirname(__DIR__) . '/Database.php';

class TestimonialController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        $stmt = $this->db->query("SELECT * FROM testimonials WHERE status = 'published' ORDER BY created_at DESC");
        echo json_encode(['error' => false, 'data' => $stmt->fetchAll(), 'message' => 'Success']);
    }
}
