
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
    <title>Barangay Official - Barangay System</title>
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

        .status-active {
            color: #10b981;
            font-weight: 600;
            background: rgba(16, 185, 129, 0.1);
            padding: 5px 10px;
            border-radius: 20px;
            display: inline-block;
        }

        .status-inactive {
            color: #ef4444;
            font-weight: 600;
            background: rgba(239, 68, 68, 0.1);
            padding: 5px 10px;
            border-radius: 20px;
            display: inline-block;
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
            max-width: 600px;
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
                min-width: 800px;
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
            <div class="menu-item" onclick="location.href='resident.php'">
                <i class="fas fa-user"></i>
                <span>Resident Information</span>
            </div>
            <div class="menu-item active" onclick="location.href='official.php'">
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
                <h1>Barangay Officials</h1>
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
                <h2 class="module-title">Barangay Officials</h2>
                <div class="action-buttons">
                    <button class="btn btn-primary" id="add-official-btn">
                        <i class="fas fa-plus"></i> Add Official
                    </button>
                    <button class="btn btn-secondary" id="filter-toggle-btn">
                        <i class="fas fa-filter"></i> Filter Officials
                    </button>
                </div>
            </div>
            <p class="storage-notice">Official records on this page are saved in this browser only and are not shared across devices.</p>

            <!-- Filter Section -->
            <div class="filter-section" id="filter-section" style="display: none;">
                <div class="filter-header">
                    <i class="fas fa-filter"></i>
                    <h3>Filter Officials</h3>
                </div>
                <div class="filter-row">
                    <div class="filter-group">
                        <label for="filter-name">Name</label>
                        <input type="text" id="filter-name" placeholder="Search by name">
                    </div>
                    <div class="filter-group">
                        <label for="filter-position">Position</label>
                        <select id="filter-position">
                            <option value="">All Positions</option>
                            <option value="Barangay Captain">Barangay Captain</option>
                            <option value="Barangay Secretary">Barangay Secretary</option>
                            <option value="Barangay Treasurer">Barangay Treasurer</option>
                            <option value="Barangay Councilor">Barangay Councilor</option>
                            <option value="SK Chairman">SK Chairman</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label for="filter-status">Status</label>
                        <select id="filter-status">
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
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
                                <th>Name</th>
                                <th>Position</th>
                                <th>Contact</th>
                                <th>Email</th>
                                <th>Term Start</th>
                                <th>Term End</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="officials-table-body">
                            <!-- Officials will be dynamically added here -->
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="footer">
                <p>© 2024 Barangay San Isidro Information System. All rights reserved.</p>
            </div>
        </div>
    </div>

    <!-- Add/Edit Official Modal -->
    <div class="modal" id="official-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Add New Official</h3>
                <button class="close-btn" id="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="official-form">
                    <input type="hidden" id="edit-official-id">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="official-name">Full Name *</label>
                            <input type="text" id="official-name" name="official_name" required>
                        </div>
                        <div class="form-group">
                            <label for="position">Position *</label>
                            <select id="position" name="position" required>
                                <option value="">Select Position</option>
                                <option value="Barangay Captain">Barangay Captain</option>
                                <option value="Barangay Secretary">Barangay Secretary</option>
                                <option value="Barangay Treasurer">Barangay Treasurer</option>
                                <option value="Barangay Councilor">Barangay Councilor</option>
                                <option value="SK Chairman">SK Chairman</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="contact-number">Contact Number *</label>
                            <input type="tel" id="contact-number" name="contact_number" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" name="email">
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="term-start">Term Start *</label>
                            <input type="date" id="term-start" name="term_start" required>
                        </div>
                        <div class="form-group">
                            <label for="term-end">Term End *</label>
                            <input type="date" id="term-end" name="term_end" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="status">Status *</label>
                            <select id="status" name="status" required>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-official">Cancel</button>
                <button class="btn btn-primary" id="save-official">Save Official</button>
            </div>
        </div>
    </div>

    <script>
        // Define currentUser from PHP
    const currentUser = "<?php echo isset($username) ? htmlspecialchars($username) : ''; ?>";

    // Check if user is logged in
    function checkAuth() {
        // Inner function kept as in your original code
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

        // Generate official ID
        function generateOfficialId() {
            const officials = JSON.parse(localStorage.getItem('officials') || '[]');
            const nextId = officials.length + 1;
            return `OFF-${String(nextId).padStart(3, '0')}`;
        }

        // Modal functionality
        const modal = document.getElementById('official-modal');
        const addOfficialBtn = document.getElementById('add-official-btn');
        const closeModalBtn = document.getElementById('close-modal');
        const cancelBtn = document.getElementById('cancel-official');
        const saveBtn = document.getElementById('save-official');
        const officialForm = document.getElementById('official-form');
        const modalTitle = document.getElementById('modal-title');

        // Filter functionality
        const filterToggleBtn = document.getElementById('filter-toggle-btn');
        const filterSection = document.getElementById('filter-section');
        const applyFiltersBtn = document.getElementById('apply-filters');
        const clearFiltersBtn = document.getElementById('clear-filters');

        let currentFilters = {};
        let editingOfficialId = null;

        // Open modal for adding new official
        addOfficialBtn.addEventListener('click', function() {
            editingOfficialId = null;
            modalTitle.textContent = 'Add New Official';
            officialForm.reset();
            modal.style.display = 'flex';
        });

        // Close modal
        function closeModal() {
            modal.style.display = 'none';
            editingOfficialId = null;
        }

        closeModalBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);

        // Save official (both add and edit)
        saveBtn.addEventListener('click', function() {
            // Validate form
            if (!officialForm.checkValidity()) {
                officialForm.reportValidity();
                return;
            }

            // Get form data
            const formData = {
                official_id: editingOfficialId || generateOfficialId(),
                name: document.getElementById('official-name').value,
                position: document.getElementById('position').value,
                contact: document.getElementById('contact-number').value,
                email: document.getElementById('email').value,
                term_start: document.getElementById('term-start').value,
                term_end: document.getElementById('term-end').value,
                status: document.getElementById('status').value
            };

            // Save to localStorage
            const officials = JSON.parse(localStorage.getItem('officials') || '[]');
            
            if (editingOfficialId) {
                // Update existing official
                const index = officials.findIndex(o => o.official_id === editingOfficialId);
                if (index !== -1) {
                    officials[index] = formData;
                }
            } else {
                // Add new official
                officials.push(formData);
            }
            
            localStorage.setItem('officials', JSON.stringify(officials));

            // Update table
            loadOfficials();

            // Close modal
            closeModal();

            // Show success message
            alert(`Official ${editingOfficialId ? 'updated' : 'added'} successfully!`);
        });

        // Edit official
        function editOfficial(officialId) {
            const officials = JSON.parse(localStorage.getItem('officials') || '[]');
            const official = officials.find(o => o.official_id === officialId);
            
            if (official) {
                editingOfficialId = officialId;
                modalTitle.textContent = 'Edit Official';
                
                // Fill form with official data
                document.getElementById('official-name').value = official.name;
                document.getElementById('position').value = official.position;
                document.getElementById('contact-number').value = official.contact;
                document.getElementById('email').value = official.email || '';
                document.getElementById('term-start').value = official.term_start;
                document.getElementById('term-end').value = official.term_end;
                document.getElementById('status').value = official.status;
                
                // Show modal
                modal.style.display = 'flex';
            }
        }

        // Delete official
        function deleteOfficial(officialId) {
            if (confirm('Are you sure you want to delete this official?')) {
                const officials = JSON.parse(localStorage.getItem('officials') || '[]');
                const filteredOfficials = officials.filter(o => o.official_id !== officialId);
                localStorage.setItem('officials', JSON.stringify(filteredOfficials));
                loadOfficials();
                alert('Official deleted successfully!');
            }
        }

        // Filter functionality
        filterToggleBtn.addEventListener('click', function() {
            filterSection.style.display = filterSection.style.display === 'none' ? 'block' : 'none';
        });

        applyFiltersBtn.addEventListener('click', function() {
            currentFilters = {
                name: document.getElementById('filter-name').value.toLowerCase(),
                position: document.getElementById('filter-position').value,
                status: document.getElementById('filter-status').value
            };
            loadOfficials();
        });

        clearFiltersBtn.addEventListener('click', function() {
            document.getElementById('filter-name').value = '';
            document.getElementById('filter-position').value = '';
            document.getElementById('filter-status').value = '';
            currentFilters = {};
            loadOfficials();
        });

        // Load officials from localStorage with filters
        function loadOfficials() {
            const officials = JSON.parse(localStorage.getItem('officials') || '[]');
            const tableBody = document.getElementById('officials-table-body');
            
            tableBody.innerHTML = '';

            // Apply filters
            const filteredOfficials = officials.filter(official => {
                if (currentFilters.name && !official.name.toLowerCase().includes(currentFilters.name)) {
                    return false;
                }
                if (currentFilters.position && official.position !== currentFilters.position) {
                    return false;
                }
                if (currentFilters.status && official.status !== currentFilters.status) {
                    return false;
                }
                return true;
            });

            if (filteredOfficials.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="8" class="empty-state-cell">No official records match. Add an official or adjust your filters.</td></tr>';
                return;
            }

            filteredOfficials.forEach(official => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${official.name}</td>
                    <td>${official.position}</td>
                    <td>${official.contact}</td>
                    <td>${official.email || 'N/A'}</td>
                    <td>${official.term_start}</td>
                    <td>${official.term_end}</td>
                    <td><span class="${official.status === 'Active' ? 'status-active' : 'status-inactive'}">${official.status}</span></td>
                    <td>
                        <div class="action-buttons-cell">
                            <button class="action-btn btn-warning" onclick="editOfficial('${official.official_id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="action-btn btn-danger" onclick="deleteOfficial('${official.official_id}')">
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
                loadOfficials();
            }
        });
    </script>
</body>
</html>