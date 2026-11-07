<?php
session_start();
require_once '../server/config.php';

header('Content-Type: application/json');

// Read JSON input
$input = json_decode(file_get_contents('php://input'), true);

// Handle insert/update requests
if ($input) {
    $family_name = $input['family_name'];
    $address = $input['address'];
    $head_of_family_name = trim($input['head_of_family'] ?? ''); // typed name
    $editing = (bool)($input['editing'] ?? false);
    $family_id = $input['family_id'] ?? null;

    // Convert typed name to Resident_ID
    $head_of_family = null;
    if ($head_of_family_name) {
        $stmt = $pdo->prepare("SELECT Resident_ID FROM residents WHERE CONCAT(First_Name, ' ', Last_Name) = ?");
        $stmt->execute([$head_of_family_name]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($res) {
            $head_of_family = $res['Resident_ID'];
        } else {
            $head_of_family = null; // not found, keep NULL
        }
    }

    try {
        if ($editing && $family_id) {
            // Update existing family
            $stmt = $pdo->prepare("UPDATE family SET Family_Name = ?, Address = ?, Head_of_Family = ? WHERE Family_ID = ?");
            $stmt->execute([$family_name, $address, $head_of_family, $family_id]);
            echo json_encode(['success' => true, 'message' => 'Family updated successfully']);
        } else {
            // Insert new family, allow Head_of_Family to be NULL
            $stmt = $pdo->prepare("INSERT INTO family (Family_Name, Address, Head_of_Family) VALUES (?, ?, ?)");
            $stmt->execute([$family_name, $address, $head_of_family]);
            $newId = $pdo->lastInsertId();
            echo json_encode(['success' => true, 'message' => 'Family added successfully', 'Family_ID' => $newId]);
        }
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// Handle fetch-all request
if (isset($_GET['action']) && $_GET['action'] === 'fetch') {
    try {
        $stmt = $pdo->query("
            SELECT f.Family_ID, f.Family_Name, f.Address, f.Head_of_Family,
                   r.First_Name, r.Last_Name
            FROM family f
            LEFT JOIN residents r ON f.Head_of_Family = r.Resident_ID
            ORDER BY f.Family_ID DESC
        ");
        $families = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($families as &$f) {
            $f['Head_of_Family_Name'] = ($f['First_Name'] && $f['Last_Name']) ? $f['First_Name'] . ' ' . $f['Last_Name'] : '—';
            unset($f['First_Name'], $f['Last_Name']);
        }

        echo json_encode($families);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// Handle fetch single family request
if (isset($_GET['action']) && $_GET['action'] === 'get') {
    $family_id = $_GET['family_id'] ?? null;
    if (!$family_id) {
        echo json_encode(null);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT f.Family_ID, f.Family_Name, f.Address, f.Head_of_Family,
                   r.First_Name, r.Last_Name
            FROM family f
            LEFT JOIN residents r ON f.Head_of_Family = r.Resident_ID
            WHERE f.Family_ID = ?
        ");
        $stmt->execute([$family_id]);
        $family = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($family) {
            $family['Head_of_Family_Name'] = ($family['First_Name'] && $family['Last_Name']) ? $family['First_Name'] . ' ' . $family['Last_Name'] : '—';
            unset($family['First_Name'], $family['Last_Name']);
        }

        echo json_encode($family);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// If no input and no action
echo json_encode(['success' => false, 'message' => 'No action specified']);
?>
