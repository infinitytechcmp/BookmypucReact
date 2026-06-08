<?php

require_once dirname(__DIR__) . '/Database.php';

class SliderController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        $stmt = $this->db->query("SELECT id, name, `key`, description FROM simple_sliders WHERE status = 'published'");
        $sliders = $stmt->fetchAll();

        foreach ($sliders as &$slider) {
            $slider['items'] = $this->getSliderItems($slider['id']);
        }

        echo json_encode([
            'error' => false,
            'data' => $sliders,
            'message' => 'Success'
        ]);
    }

    public function getByKey($key) {
        $stmt = $this->db->prepare("SELECT id, name, `key`, description FROM simple_sliders WHERE `key` = ? AND status = 'published' LIMIT 1");
        $stmt->execute([$key]);
        $slider = $stmt->fetch();

        if (!$slider) {
            http_response_code(404);
            echo json_encode(['error' => true, 'data' => null, 'message' => 'Slider not found']);
            return;
        }

        $slider['items'] = $this->getSliderItems($slider['id']);

        echo json_encode([
            'error' => false,
            'data' => $slider,
            'message' => 'Success'
        ]);
    }

    private function getSliderItems($sliderId) {
        $stmt = $this->db->prepare("SELECT id, title, description, image, link, subtitle, button_label FROM simple_slider_items WHERE simple_slider_id = ? ORDER BY `order` ASC");
        $stmt->execute([$sliderId]);
        return $stmt->fetchAll();
    }
}
