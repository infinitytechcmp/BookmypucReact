<?php

require_once dirname(__DIR__) . '/Database.php';

class FaqController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function getFaqs() {
        $categoryId = $_GET['category_id'] ?? null;
        
        if ($categoryId) {
            $stmt = $this->db->prepare("SELECT * FROM faqs WHERE category_id = ? AND status = 'published' ORDER BY created_at DESC");
            $stmt->execute([$categoryId]);
        } else {
            $stmt = $this->db->query("SELECT * FROM faqs WHERE status = 'published' ORDER BY created_at DESC");
        }
        
        echo json_encode(['error' => false, 'data' => $stmt->fetchAll(), 'message' => 'Success']);
    }

    public function getCategories() {
        $stmt = $this->db->query("SELECT * FROM faq_categories WHERE status = 'published' ORDER BY created_at DESC");
        echo json_encode(['error' => false, 'data' => $stmt->fetchAll(), 'message' => 'Success']);
    }
}
