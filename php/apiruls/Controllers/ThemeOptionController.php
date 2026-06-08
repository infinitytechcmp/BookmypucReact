<?php

require_once dirname(__DIR__) . '/Database.php';

class ThemeOptionController {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function index() {
        $stmt = $this->db->query("SELECT `key`, `value` FROM settings WHERE `key` LIKE 'theme-%'");
        $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Remove 'theme-' prefix for cleaner output
        $formattedSettings = [];
        foreach ($settings as $key => $value) {
            $formattedKey = str_replace('theme-', '', $key);
            $formattedSettings[$formattedKey] = $value;
        }

        echo json_encode([
            'error' => false,
            'data' => $formattedSettings,
            'message' => 'Success'
        ]);
    }
}
