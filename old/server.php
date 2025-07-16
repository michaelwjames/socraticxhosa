<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$file = isset($_GET['file']) ? $_GET['file'] : 'Xhosa_notes.json';
$allowedFiles = ['Xhosa_notes.json', 'Xhosa_texts.json'];

if (in_array($file, $allowedFiles) && file_exists($file)) {
    echo file_get_contents($file);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'File not found']);
}
?>
