<?php

require_once dirname(__DIR__) . '/Database.php';

class MenuController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        $stmt = $this->db->query("SELECT id, name, slug FROM menus WHERE status = 'published'");
        $menus = $stmt->fetchAll();

        echo json_encode([
            'error' => false,
            'data' => $menus,
            'message' => 'Success'
        ]);
    }

    public function getBySlug($slug) {
        // Fetch the menu
        $stmt = $this->db->prepare("SELECT id, name, slug FROM menus WHERE slug = ? AND status = 'published' LIMIT 1");
        $stmt->execute([$slug]);
        $menu = $stmt->fetch();

        if (!$menu) {
            http_response_code(404);
            echo json_encode(['error' => true, 'data' => null, 'message' => 'Menu not found']);
            return;
        }

        // Fetch nodes
        $stmtNodes = $this->db->prepare("SELECT * FROM menu_nodes WHERE menu_id = ? ORDER BY position ASC");
        $stmtNodes->execute([$menu['id']]);
        $allNodes = $stmtNodes->fetchAll();

        $menu['menu_nodes'] = $this->buildTree($allNodes);

        echo json_encode([
            'error' => false,
            'data' => $menu,
            'message' => 'Success'
        ]);
    }

    private function buildTree(array $elements, $parentId = 0) {
        $branch = array();

        foreach ($elements as $element) {
            if ($element['parent_id'] == $parentId) {
                $children = $this->buildTree($elements, $element['id']);
                if ($children) {
                    $element['child'] = $children;
                } else {
                    $element['child'] = [];
                }
                $branch[] = $element;
            }
        }

        return $branch;
    }
}
