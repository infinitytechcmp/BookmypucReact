<?php

require_once dirname(__DIR__) . '/Database.php';

class TeamController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        $stmt = $this->db->query("SELECT * FROM teams WHERE status = 'published' ORDER BY created_at DESC");
        echo json_encode(['error' => false, 'data' => $stmt->fetchAll(), 'message' => 'Success']);
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM teams WHERE id = ? AND status = 'published' LIMIT 1");
        $stmt->execute([$id]);
        $team = $stmt->fetch();

        if ($team) {
            echo json_encode(['error' => false, 'data' => $team, 'message' => 'Success']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => true, 'data' => null, 'message' => 'Team member not found']);
        }
    }
}
