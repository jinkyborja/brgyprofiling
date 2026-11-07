<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header("Location: index.html");
    exit();
}

$username = $_SESSION['username'] ?? "User";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resident Information - Barangay System</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        :root {
            --primary-color: #1e5799;
            --primary-light: #4a86d4;
            --secondary-color: #16457a;
            --accent-color: #2989d8;
            --accent-light: #5ca8f0;
            --sidebar-width: 280px;
            --header-height: 70px;
            --sidebar-bg: #1a2530;
            --sidebar-hover: #2c3e50;
            --success-color: #10b981;
            --warning-color: #f59e0b;
            --info-color: #3b82f6;
        }

        body {
            background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
            display: flex;
            min-height: 100vh;
            color: #333;
            overflow-x: hidden;
        }

        /* Enhanced Sidebar */
        .sidebar {
            width: var(--sidebar-width);
            background: linear-gradient(180deg, var(--sidebar-bg) 0%, #15202b 100%);
            color: white;
            height: 100vh;
            position: fixed;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: 4px 0 15px rgba(0, 0, 0, 0.1);
            overflow-y: auto;
        }

        .sidebar-header {
            padding: 25px 20px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            overflow: hidden;
        }

        .sidebar-header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%);
        }

        .sidebar-header h2 {
            font-size: 22px;
            margin-bottom: 8px;
            font-weight: 700;
            position: relative;
        }

        .sidebar-header p {
            font-size: 13px;
            opacity: 0.9;
            font-weight: 300;
            position: relative;
        }

        .sidebar-menu {
            padding: 20px 0;
        }

        .menu-item {
            padding: 15px 25px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: all 0.3s ease;
            border-left: 4px solid transparent;
            margin: 5px 15px;
            border-radius: 8px;
            position: relative;
            overflow: hidden;
        }

        .menu-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            transition: left 0.5s;
        }

        .menu-item:hover::before {
            left: 100%;
        }

        .menu-item:hover {
            background-color: var(--sidebar-hover);
            border-left: 4px solid var(--accent-light);
            transform: translateX(5px);
        }

        .menu-item.active {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            border-left: 4px solid white;
            box-shadow: 0 4px 12px rgba(30, 87, 153, 0.3);
        }

        .menu-item i {
            margin-right: 15px;
            font-size: 18px;
            width: 20px;
            text-align: center;
            transition: transform 0.3s ease;
        }

        .menu-item:hover i {
            transform: scale(1.1);
        }

        .menu-item span {
            font-size: 15px;
            font-weight: 500;
        }

        /* Mobile menu toggle */
        .menu-toggle {
            display: none;
            position: fixed;
            top: 15px;
            left: 15px;
            z-index: 1100;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 5px;
            width: 40px;
            height: 40px;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }

        /* Enhanced Main Content */
        .main-content {
            flex: 1;
            margin-left: var(--sidebar-width);
            transition: all 0.3s ease;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            width: calc(100% - var(--sidebar-width));
        }

        .header {
            height: var(--header-height);
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 30px;
            position: sticky;
            top: 0;
            z-index: 100;
            border-bottom: 1px solid #e2e8f0;
        }

        .header-left h1 {
            font-size: 26px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .user-info {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 15px;
            background: white;
            border-radius: 50px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            transition: all 0.3s ease;
        }

        .user-info:hover {
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            transform: translateY(-2px);
        }

        .user-avatar {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 16px;
            box-shadow: 0 4px 8px rgba(30, 87, 153, 0.3);
        }

        .logout-btn {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .logout-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(220, 38, 38, 0.4);
        }

        .content {
            padding: 30px;
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        .module-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e2e8f0;
        }

        .module-title {
            font-size: 32px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: 700;
            position: relative;
        }

        .module-title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 0;
            width: 60px;
            height: 4px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            border-radius: 2px;
        }

        .action-buttons {
            display: flex;
            gap: 15px;
        }

        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(30, 87, 153, 0.4);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
            color: white;
        }

        .btn-secondary:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(75, 85, 99, 0.4);
        }

        .btn-warning {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
        }

        .btn-warning:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(217, 119, 6, 0.4);
        }

        .btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }

        .btn-danger:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px rgba(220, 38, 38, 0.4);
        }

        /* Enhanced Table Design */
        .table-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            position: relative;
        }

        .table-wrapper::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            border-radius: 16px 16px 0 0;
            z-index: 10;
        }

        .table-container {
            overflow: auto;
            flex: 1;
            border-radius: 16px;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            background-color: white;
            min-width: 1400px; /* Ensure table has enough width for all columns */
        }

        .data-table th {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            color: white;
            padding: 15px 20px;
            text-align: left;
            position: sticky;
            top: 0;
            font-weight: 600;
            font-size: 15px;
            white-space: nowrap;
        }

        .data-table td {
            padding: 15px 20px;
            border-bottom: 1px solid #e2e8f0;
            color: #4b5563;
            white-space: nowrap;
        }

        .data-table tr {
            transition: all 0.3s ease;
        }

        .data-table tr:hover {
            background-color: #f0f9ff;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .data-table tr:last-child td {
            border-bottom: none;
        }

        .optional {
            color: #6b7280;
            font-style: italic;
        }

        /* Enhanced Filter Section */
        .filter-section {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
        }

        .filter-section::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
        }

        .filter-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }

        .filter-header i {
            margin-right: 10px;
            color: var(--primary-color);
            font-size: 20px;
        }

        .filter-header h3 {
            color: var(--primary-color);
            font-size: 20px;
            font-weight: 600;
        }

        .filter-row {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            margin-bottom: 20px;
        }

        .filter-group {
            flex: 1;
            min-width: 200px;
        }

        .filter-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--primary-color);
            font-size: 14px;
        }

        .filter-group input, .filter-group select {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: white;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .filter-group input:focus, .filter-group select:focus {
            border-color: var(--accent-color);
            outline: none;
            box-shadow: 0 0 0 3px rgba(41, 137, 216, 0.1);
        }

        .filter-actions {
            display: flex;
            gap: 15px;
            justify-content: flex-end;
        }

        /* Action buttons in table */
        .action-buttons-cell {
            display: flex;
            gap: 8px;
            position: sticky;
            right: 0;
            background: inherit;
        }

        .action-btn {
            padding: 8px 12px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.3s ease;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            white-space: nowrap;
        }

        .action-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }

        /* Modal Styles */
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 2000;
            justify-content: center;
            align-items: center;
        }

        .modal-content {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 16px;
            width: 90%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            position: relative;
        }

        .modal-content::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            border-radius: 16px 16px 0 0;
        }

        .modal-header {
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            color: white;
            padding: 25px 30px;
            border-radius: 16px 16px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h3 {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
        }

        .close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 24px;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: all 0.3s ease;
        }

        .close-btn:hover {
            background: rgba(255, 255, 255, 0.2);
        }

        .modal-body {
            padding: 30px;
        }

        .form-row {
            display: flex;
            flex-wrap: wrap;
            margin: 0 -10px;
        }

        .form-group {
            flex: 1 0 300px;
            margin: 0 10px 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: var(--primary-color);
        }

        .form-group input, .form-group select {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
            background: white;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .form-group input:focus, .form-group select:focus {
            border-color: var(--accent-color);
            outline: none;
            box-shadow: 0 0 0 3px rgba(41, 137, 216, 0.1);
        }

        .age-display {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            padding: 12px 15px;
            border-radius: 8px;
            margin-top: 8px;
            font-weight: 600;
            color: var(--primary-color);
            border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .modal-footer {
            padding: 20px 30px;
            border-top: 1px solid #e2e8f0;
            display: flex;
            justify-content: flex-end;
            gap: 15px;
        }

        /* Enhanced Footer */
        .footer {
            text-align: center;
            padding: 20px;
            margin-top: 40px;
            color: #6b7280;
            font-size: 14px;
            border-top: 1px solid #e2e8f0;
        }

        /* Mobile Responsive */
        @media (max-width: 1024px) {
            .sidebar {
                width: 80px;
                transform: translateX(0);
            }
            
            .sidebar-header h2, .sidebar-header p, .menu-item span {
                display: none;
            }
            
            .menu-item {
                justify-content: center;
                padding: 15px;
                margin: 5px 10px;
            }
            
            .menu-item i {
                margin-right: 0;
                font-size: 20px;
            }
            
            .main-content {
                margin-left: 80px;
                width: calc(100% - 80px);
            }
        }

        @media (max-width: 768px) {
            .menu-toggle {
                display: block;
            }
            
            .sidebar {
                transform: translateX(-100%);
                width: 280px;
            }
            
            .sidebar.active {
                transform: translateX(0);
            }
            
            .sidebar.active ~ .main-content::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 999;
            }
            
            .main-content {
                margin-left: 0;
                width: 100%;
            }
            
            .header {
                padding: 0 20px;
            }
            
            .module-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 15px;
            }
            
            .action-buttons {
                width: 100%;
                justify-content: flex-start;
                flex-wrap: wrap;
            }
            
            .filter-row {
                flex-direction: column;
            }
            
            .table-container {
                overflow-x: auto;
            }
            
            .data-table {
                min-width: 1200px;
            }
            
            .modal-content {
                width: 95%;
                margin: 20px;
            }
        }

        @media (max-width: 480px) {
            .content {
                padding: 20px 15px;
            }
            
            .filter-section {
                padding: 20px;
            }
            
            .header-right {
                gap: 10px;
            }
            
            .user-info span {
                display: none;
            }
            
            .btn {
                padding: 10px 15px;
                font-size: 13px;
            }
            
            .action-buttons-cell {
                flex-direction: column;
                gap: 5px;
            }
        }
    </style>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
    <script src="js/ui.js" defer></script>
</head>
<body>
    <button type="button" class="menu-toggle" id="menuToggle" aria-label="Toggle navigation menu" aria-controls="sidebar" aria-expanded="false">
        <i class="fas fa-bars"></i>
    </button>

    <div class="sidebar" id="sidebar">
        <div class="sidebar-header">
            <h2>Community Profiling</h2>
            <p>Information Management System</p>
        </div>
        <div class="sidebar-menu">
            <div class="menu-item" onclick="location.href='dashboard.php'">
                <i class="fas fa-tachometer-alt"></i>
                <span>Dashboard</span>
            </div>
            <div class="menu-item" onclick="location.href='family.php'">
                <i class="fas fa-users"></i>
                <span>Family Information</span>
            </div>
            <div class="menu-item active" onclick="location.href='resident.php'">
                <i class="fas fa-user"></i>
                <span>Resident Information</span>
            </div>
            <div class="menu-item" onclick="location.href='official.php'">
                <i class="fas fa-user-tie"></i>
                <span>Barangay Official</span>
            </div>
            <div class="menu-item" onclick="location.href='info.php'">
                <i class="fas fa-info-circle"></i>
                <span>Barangay Info</span>
            </div>
            <div class="menu-item" onclick="location.href='certificate.php'">
                <i class="fas fa-certificate"></i>
                <span>Certificate Information</span>
            </div>
        </div>
    </div>

    <div class="main-content">
        <div class="header">
            <div class="header-left">
                <h1>Resident Information</h1>
            </div>
            <div class="header-right">
                <div class="user-info">
                    <div class="user-avatar" id="user-avatar">AD</div>
                    <span id="username-display">Admin User</span>
                </div>
                <button class="logout-btn" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>

        <div class="content">
            <div class="module-header">
                <h2 class="module-title">Resident Information</h2>
                <div class="action-buttons">
                    <button class="btn btn-primary" id="add-resident-btn">
                        <i class="fas fa-plus"></i> Add Resident
                    </button>
                    <button class="btn btn-secondary" id="filter-toggle-btn">
                        <i class="fas fa-filter"></i> Filter Residents
                    </button>
                </div>
            </div>
            <p class="storage-notice">Resident records on this page are saved in this browser only and are not shared across devices.</p>

            <!-- Filter Section -->
            <div class="filter-section" id="filter-section" style="display: none;">
                <div class="filter-header">
                    <i class="fas fa-filter"></i>
                    <h3>Filter Residents</h3>
                </div>
                <div class="filter-row">
                    <div class="filter-group">
                        <label for="filter-family-id">Family ID</label>
                        <input type="text" id="filter-family-id" placeholder="Enter Family ID">
                    </div>
                    <div class="filter-group">
                        <label for="filter-name">Name</label>
                        <input type="text" id="filter-name" placeholder="Search by name">
                    </div>
                    <div class="filter-group">
                        <label for="filter-gender">Gender</label>
                        <select id="filter-gender">
                            <option value="">All Genders</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                        </select>
                    </div>
                </div>
                <div class="filter-row">
                    <div class="filter-group">
                        <label for="filter-civil-status">Civil Status</label>
                        <select id="filter-civil-status">
                            <option value="">All Status</option>
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Widowed">Widowed</option>
                            <option value="Separated">Separated</option>
                            <option value="Divorced">Divorced</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-relationship">Relationship</label>
                        <select id="filter-relationship">
                            <option value="">All Relationships</option>
                            <option value="Head">Head</option>
                            <option value="Spouse">Spouse</option>
                            <option value="Child">Child</option>
                            <option value="Parent">Parent</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Other Relative">Other Relative</option>
                            <option value="Non-Relative">Non-Relative</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-disability">Disability Status</label>
                        <select id="filter-disability">
                            <option value="">All Status</option>
                            <option value="None">None</option>
                            <option value="Visual Impairment">Visual Impairment</option>
                            <option value="Hearing Impairment">Hearing Impairment</option>
                            <option value="Physical Disability">Physical Disability</option>
                            <option value="Intellectual Disability">Intellectual Disability</option>
                            <option value="Psychosocial Disability">Psychosocial Disability</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="filter-actions">
                    <button class="btn btn-secondary" id="clear-filters">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                    <button class="btn btn-primary" id="apply-filters">
                        <i class="fas fa-check"></i> Apply Filters
                    </button>
                </div>
            </div>
            
            <div class="table-wrapper">
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Resident ID</th>
                                <th>Family ID</th>
                                <th>First Name</th>
                                <th>Middle Name</th>
                                <th>Last Name</th>
                                <th>Suffix</th>
                                <th>Gender</th>
                                <th>Date of Birth</th>
                                <th>Age</th>
                                <th>Civil Status</th>
                                <th>Relationship to Head</th>
                                <th>Education Attainment</th>
                                <th>Contact Number</th>
                                <th>Disability Status</th>
                                <th>Religion</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="residents-table-body">
                            <!-- Residents will be dynamically added here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="footer">
                <p>© 2024 Barangay San Isidro Information System. All rights reserved.</p>
            </div>
        </div>
    </div>

    <!-- Add/Edit Resident Modal -->
    <div class="modal" id="resident-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Add New Resident</h3>
                <button class="close-btn" id="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="resident-form">
                    <input type="hidden" id="edit-resident-id">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="resident-id">Resident ID *</label>
                            <input type="text" id="resident-id" name="resident_id" required readonly>
                        </div>
                        <div class="form-group">
                            <label for="family-id">Family ID *</label>
                            <input type="text" id="family-id" name="family_id" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="first-name">First Name *</label>
                            <input type="text" id="first-name" name="first_name" required>
                        </div>
                        <div class="form-group">
                            <label for="middle-name">Middle Name</label>
                            <input type="text" id="middle-name" name="middle_name">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="last-name">Last Name *</label>
                            <input type="text" id="last-name" name="last_name" required>
                        </div>
                        <div class="form-group">
                            <label for="suffix">Suffix</label>
                            <select id="suffix" name="suffix">
                                <option value="">None</option>
                                <option value="Jr.">Jr.</option>
                                <option value="Sr.">Sr.</option>
                                <option value="II">II</option>
                                <option value="III">III</option>
                                <option value="IV">IV</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="gender">Gender *</label>
                            <select id="gender" name="gender" required>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="date-of-birth">Date of Birth *</label>
                            <input type="date" id="date-of-birth" name="date_of_birth" required>
                            <div id="age-display" class="age-display">Age: --</div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="civil-status">Civil Status *</label>
                            <select id="civil-status" name="civil_status" required>
                                <option value="">Select Civil Status</option>
                                <option value="Single">Single</option>
                                <option value="Married">Married</option>
                                <option value="Widowed">Widowed</option>
                                <option value="Separated">Separated</option>
                                <option value="Divorced">Divorced</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="relationship">Relationship to Head *</label>
                            <select id="relationship" name="relationship" required>
                                <option value="">Select Relationship</option>
                                <option value="Head">Head</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Child">Child</option>
                                <option value="Parent">Parent</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Other Relative">Other Relative</option>
                                <option value="Non-Relative">Non-Relative</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="education">Education Attainment *</label>
                            <select id="education" name="education" required>
                                <option value="">Select Education</option>
                                <option value="No Formal Education">No Formal Education</option>
                                <option value="Elementary Level">Elementary Level</option>
                                <option value="Elementary Graduate">Elementary Graduate</option>
                                <option value="High School Level">High School Level</option>
                                <option value="High School Graduate">High School Graduate</option>
                                <option value="College Level">College Level</option>
                                <option value="College Graduate">College Graduate</option>
                                <option value="Post Graduate">Post Graduate</option>
                                <option value="Vocational">Vocational</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="contact-number">Contact Number *</label>
                            <input type="tel" id="contact-number" name="contact_number" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="disability">Disability Status</label>
                            <select id="disability" name="disability">
                                <option value="None">None</option>
                                <option value="Visual Impairment">Visual Impairment</option>
                                <option value="Hearing Impairment">Hearing Impairment</option>
                                <option value="Physical Disability">Physical Disability</option>
                                <option value="Intellectual Disability">Intellectual Disability</option>
                                <option value="Psychosocial Disability">Psychosocial Disability</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="religion">Religion *</label>
                            <input type="text" id="religion" name="religion" required>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-resident">Cancel</button>
                <button class="btn btn-primary" id="save-resident">Save Resident</button>
            </div>
        </div>
    </div>

    <script>
        // Define currentUser from PHP
    const currentUser = "<?php echo isset($username) ? htmlspecialchars($username) : ''; ?>";

    // Check if user is logged in
    function checkAuth() {
        // Keep the inner function structure intact
        function checkAuthInner() {
            return {
                username: currentUser
            };
        }

        // Return the current user object
        return checkAuthInner();
    }

        // Update user interface with current user info
        function updateUserInterface(user) {
            if (user) {
                const firstLetter = user.username.charAt(0).toUpperCase();
                document.getElementById('user-avatar').textContent = firstLetter;
                document.getElementById('username-display').textContent = user.username;
            }
        }

        // Calculate age from date of birth
        function calculateAge(dateOfBirth) {
            const today = new Date();
            const birthDate = new Date(dateOfBirth);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            return age;
        }

        // Generate resident ID
        function generateResidentId() {
            const residents = JSON.parse(localStorage.getItem('residents') || '[]');
            const nextId = residents.length + 2001;
            return `RES-${nextId}`;
        }

        // Modal functionality
        const modal = document.getElementById('resident-modal');
        const addResidentBtn = document.getElementById('add-resident-btn');
        const closeModalBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-resident');
        const saveBtn = document.getElementById('save-resident');
        const residentForm = document.getElementById('resident-form');
        const dateOfBirthInput = document.getElementById('date-of-birth');
        const ageDisplay = document.getElementById('age-display');
        const modalTitle = document.getElementById('modal-title');

        // Filter functionality
        const filterToggleBtn = document.getElementById('filter-toggle-btn');
        const filterSection = document.getElementById('filter-section');
        const applyFiltersBtn = document.getElementById('apply-filters');
        const clearFiltersBtn = document.getElementById('clear-filters');

        let currentFilters = {};
        let editingResidentId = null;

        // Open modal for adding new resident
        addResidentBtn.addEventListener('click', function() {
            editingResidentId = null;
            modalTitle.textContent = 'Add New Resident';
            document.getElementById('resident-id').value = generateResidentId();
            residentForm.reset();
            ageDisplay.textContent = 'Age: --';
            modal.style.display = 'flex';
        });

        // Close modal
        function closeModal() {
            modal.style.display = 'none';
            editingResidentId = null;
        }

        closeModalBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Calculate age when date of birth changes
        dateOfBirthInput.addEventListener('change', function() {
            const age = calculateAge(this.value);
            ageDisplay.textContent = `Age: ${age}`;
        });

        // Save resident (both add and edit)
        saveBtn.addEventListener('click', function() {
            // Validate form
            if (!residentForm.checkValidity()) {
                residentForm.reportValidity();
                return;
            }

            // Get form data
            const formData = {
                resident_id: document.getElementById('resident-id').value,
                family_id: document.getElementById('family-id').value,
                first_name: document.getElementById('first-name').value,
                middle_name: document.getElementById('middle-name').value,
                last_name: document.getElementById('last-name').value,
                suffix: document.getElementById('suffix').value,
                gender: document.getElementById('gender').value,
                date_of_birth: document.getElementById('date-of-birth').value,
                age: calculateAge(document.getElementById('date-of-birth').value),
                civil_status: document.getElementById('civil-status').value,
                relationship: document.getElementById('relationship').value,
                education: document.getElementById('education').value,
                contact_number: document.getElementById('contact-number').value,
                disability: document.getElementById('disability').value,
                religion: document.getElementById('religion').value
            };

            // Save to localStorage
            const residents = JSON.parse(localStorage.getItem('residents') || '[]');
            
            if (editingResidentId) {
                // Update existing resident
                const index = residents.findIndex(r => r.resident_id === editingResidentId);
                if (index !== -1) {
                    residents[index] = formData;
                }
            } else {
                // Add new resident
                residents.push(formData);
            }
            
            localStorage.setItem('residents', JSON.stringify(residents));

            // Update table
            loadResidents();

            // Close modal
            closeModal();

            // Show success message
            alert(`Resident ${editingResidentId ? 'updated' : 'added'} successfully!`);
        });

        // Edit resident
        function editResident(residentId) {
            const residents = JSON.parse(localStorage.getItem('residents') || '[]');
            const resident = residents.find(r => r.resident_id === residentId);
            
            if (resident) {
                editingResidentId = residentId;
                modalTitle.textContent = 'Edit Resident';
                
                // Fill form with resident data
                document.getElementById('resident-id').value = resident.resident_id;
                document.getElementById('family-id').value = resident.family_id;
                document.getElementById('first-name').value = resident.first_name;
                document.getElementById('middle-name').value = resident.middle_name;
                document.getElementById('last-name').value = resident.last_name;
                document.getElementById('suffix').value = resident.suffix;
                document.getElementById('gender').value = resident.gender;
                document.getElementById('date-of-birth').value = resident.date_of_birth;
                document.getElementById('civil-status').value = resident.civil_status;
                document.getElementById('relationship').value = resident.relationship;
                document.getElementById('education').value = resident.education;
                document.getElementById('contact-number').value = resident.contact_number;
                document.getElementById('disability').value = resident.disability;
                document.getElementById('religion').value = resident.religion;
                
                // Update age display
                const age = calculateAge(resident.date_of_birth);
                ageDisplay.textContent = `Age: ${age}`;
                
                // Show modal
                modal.style.display = 'flex';
            }
        }

        // Delete resident
        function deleteResident(residentId) {
            if (confirm('Are you sure you want to delete this resident?')) {
                const residents = JSON.parse(localStorage.getItem('residents') || '[]');
                const filteredResidents = residents.filter(r => r.resident_id !== residentId);
                localStorage.setItem('residents', JSON.stringify(filteredResidents));
                loadResidents();
                alert('Resident deleted successfully!');
            }
        }

        // Filter functionality
        filterToggleBtn.addEventListener('click', function() {
            filterSection.style.display = filterSection.style.display === 'none' ? 'block' : 'none';
        });

        applyFiltersBtn.addEventListener('click', function() {
            currentFilters = {
                familyId: document.getElementById('filter-family-id').value.toLowerCase(),
                name: document.getElementById('filter-name').value.toLowerCase(),
                gender: document.getElementById('filter-gender').value,
                civilStatus: document.getElementById('filter-civil-status').value,
                relationship: document.getElementById('filter-relationship').value,
                disability: document.getElementById('filter-disability').value
            };
            loadResidents();
        });

        clearFiltersBtn.addEventListener('click', function() {
            document.getElementById('filter-family-id').value = '';
            document.getElementById('filter-name').value = '';
            document.getElementById('filter-gender').value = '';
            document.getElementById('filter-civil-status').value = '';
            document.getElementById('filter-relationship').value = '';
            document.getElementById('filter-disability').value = '';
            currentFilters = {};
            loadResidents();
        });

        // Load residents from localStorage with filters
        function loadResidents() {
            const residents = JSON.parse(localStorage.getItem('residents') || '[]');
            const tableBody = document.getElementById('residents-table-body');
            
            tableBody.innerHTML = '';

            // Apply filters
            const filteredResidents = residents.filter(resident => {
                if (currentFilters.familyId && !resident.family_id.toLowerCase().includes(currentFilters.familyId)) {
                    return false;
                }
                if (currentFilters.name) {
                    const fullName = `${resident.first_name} ${resident.middle_name} ${resident.last_name}`.toLowerCase();
                    if (!fullName.includes(currentFilters.name)) {
                        return false;
                    }
                }
                if (currentFilters.gender && resident.gender !== currentFilters.gender) {
                    return false;
                }
                if (currentFilters.civilStatus && resident.civil_status !== currentFilters.civilStatus) {
                    return false;
                }
                if (currentFilters.relationship && resident.relationship !== currentFilters.relationship) {
                    return false;
                }
                if (currentFilters.disability && resident.disability !== currentFilters.disability) {
                    return false;
                }
                return true;
            });

            if (filteredResidents.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="16" class="empty-state-cell">No resident records match. Add a resident or adjust your filters.</td></tr>';
                return;
            }

            filteredResidents.forEach(resident => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${resident.resident_id}</td>
                    <td>${resident.family_id}</td>
                    <td>${resident.first_name}</td>
                    <td>${resident.middle_name}</td>
                    <td>${resident.last_name}</td>
                    <td class="${!resident.suffix ? 'optional' : ''}">${resident.suffix || 'None'}</td>
                    <td>${resident.gender}</td>
                    <td>${resident.date_of_birth}</td>
                    <td>${resident.age}</td>
                    <td>${resident.civil_status}</td>
                    <td>${resident.relationship}</td>
                    <td>${resident.education}</td>
                    <td>${resident.contact_number}</td>
                    <td>${resident.disability}</td>
                    <td>${resident.religion}</td>
                    <td>
                        <div class="action-buttons-cell">
                            <button class="action-btn btn-warning" onclick="editResident('${resident.resident_id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="action-btn btn-danger" onclick="deleteResident('${resident.resident_id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        }

        // Mobile menu toggle
        document.getElementById('menuToggle').addEventListener('click', function() {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', function(event) {
            const sidebar = document.getElementById('sidebar');
            const menuToggle = document.getElementById('menuToggle');
            
            if (window.innerWidth <= 768 && 
                sidebar.classList.contains('active') && 
                !sidebar.contains(event.target) && 
                !menuToggle.contains(event.target)) {
                sidebar.classList.remove('active');
            }
        });

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            const user = checkAuth();
            if (user) {
                updateUserInterface(user);
                loadResidents();
            }
        });
    </script>
</body>
</html>