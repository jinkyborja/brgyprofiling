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
    <title>Family Information - Barangay System</title>
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
            overflow-x: hidden; /* Prevent horizontal scroll */
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
            overflow-y: auto; /* Allow sidebar scrolling if needed */
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

        /* Enhanced Card Design */
        .card {
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

        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
        }

        .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
        }

        .card-header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
        }

        .card-icon {
            width: 50px;
            height: 50px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
            font-size: 20px;
            box-shadow: 0 4px 12px rgba(30, 87, 153, 0.3);
        }

        .card h3 {
            font-size: 24px;
            color: var(--primary-color);
            font-weight: 700;
            margin: 0;
        }

        /* Enhanced Table Design */
        .table-container {
            max-height: 70vh;
            overflow-y: auto;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
            position: relative;
        }

        .table-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
            border-radius: 16px 16px 0 0;
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
        }

        .data-table td {
            padding: 15px 20px;
            border-bottom: 1px solid #e2e8f0;
            color: #4b5563;
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
            
            .card, .filter-section {
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
            <div class="menu-item active" onclick="location.href='family.php'">
                <i class="fas fa-users"></i>
                <span>Family Information</span>
            </div>
            <div class="menu-item" onclick="location.href='resident.php'">
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
                <h1>Family Information</h1>
            </div>
            <div class="header-right">
                <div class="user-info">
                    <div class="user-avatar" id="user-avatar">AD</div>
                    <span id="username-display"><?php echo htmlspecialchars($username); ?></span>
                </div>
                <button class="logout-btn" id="logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            </div>
        </div>

        <div class="content">
            <div class="module-header">
                <h2 class="module-title">Family Information</h2>
                <div class="action-buttons">
                    <button class="btn btn-primary" id="add-family-btn">
                        <i class="fas fa-plus"></i> Add Family
                    </button>
                    <button class="btn btn-secondary" id="filter-toggle-btn">
                        <i class="fas fa-filter"></i> Filter Families
                    </button>
                </div>
            </div>

            <!-- Filter Section -->
            <div class="filter-section" id="filter-section" style="display: none;">
                <div class="filter-header">
                    <i class="fas fa-filter"></i>
                    <h3>Filter Families</h3>
                </div>
                <div class="filter-row">
                    <div class="filter-group">
                        <label for="filter-family-id">Family ID</label>
                        <input type="text" id="filter-family-id" placeholder="Enter Family ID">
                    </div>
                    <div class="filter-group">
                        <label for="filter-family-name">Family Name</label>
                        <input type="text" id="filter-family-name" placeholder="Search by family name">
                    </div>
                    <div class="filter-group">
                        <label for="filter-address">Address</label>
                        <input type="text" id="filter-address" placeholder="Search by address">
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
            
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Family ID</th>
                            <th>Family Name</th>
                            <th>Address</th>
                            <th>Head of Family</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="families-table-body">
                        <!-- Families will be dynamically added here -->
                    </tbody>
                </table>
            </div>

            <div class="footer">
                <p>© 2024 Barangay San Isidro Information System. All rights reserved.</p>
            </div>
        </div>
    </div>

    <!-- Add/Edit Family Modal -->
    <div class="modal" id="family-modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 id="modal-title">Add New Family</h3>
                <button class="close-btn" id="close-modal">&times;</button>
            </div>
            <div class="modal-body">
                <form id="family-form">
                    <input type="hidden" id="edit-family-id">
                    <div class="form-row">
                        <div class="form-group">
    <label for="family-id">Family ID *</label>
    <input type="text" id="family-id" name="family_id" required>
</div>

                        <div class="form-group">
                            <label for="family-name">Family Name *</label>
                            <input type="text" id="family-name" name="family_name" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="address">Address *</label>
                            <input type="text" id="address" name="address" required>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="head-of-family">Head of Family *</label>
                            <input type="text" id="head-of-family" name="head_of_family" required>
                        </div>
                        <div class="form-group">
                            <label for="members-count">Number of Members *</label>
                            <input type="number" id="members-count" name="members_count" required min="1">
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" id="cancel-family">Cancel</button>
                <button class="btn btn-primary" id="save-family">Save Family</button>
            </div>
        </div>
    </div>

    <script>
    // Define current user from PHP
    const currentUser = "<?php echo isset($username) ? htmlspecialchars($username) : ''; ?>";

    // Check if user is logged in
    function checkAuth() {
        if (!currentUser) {
            window.location.href = 'index.html'; // redirect if not logged in
            return null;
        }
        return { username: currentUser };
    }

    // Update user interface with current user info
    function updateUserInterface(user) {
        if (user) {
            const firstLetter = user.username.charAt(0).toUpperCase();
            document.getElementById('user-avatar').textContent = firstLetter;
            document.getElementById('username-display').textContent = user.username;
        }
    }

    // Generate family ID
    function generateFamilyId() {
        return 'FAM-' + Math.floor(Math.random() * 9000 + 1000); // Random ID
    }

    // Modal functionality
    const modal = document.getElementById('family-modal');
    const addFamilyBtn = document.getElementById('add-family-btn');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-family');
    const saveBtn = document.getElementById('save-family');
    const familyForm = document.getElementById('family-form');
    const modalTitle = document.getElementById('modal-title');

    // Filter functionality
    const filterToggleBtn = document.getElementById('filter-toggle-btn');
    const filterSection = document.getElementById('filter-section');
    const applyFiltersBtn = document.getElementById('apply-filters');
    const clearFiltersBtn = document.getElementById('clear-filters');

    let currentFilters = {};
    let editingFamilyId = null;

    // Open modal for adding new family
    addFamilyBtn.addEventListener('click', function() {
        editingFamilyId = null;
        modalTitle.textContent = 'Add New Family';
        document.getElementById('family-id').value = generateFamilyId();
        familyForm.reset();
        modal.style.display = 'flex';
    });

    // Close modal
    function closeModal() {
        modal.style.display = 'none';
        editingFamilyId = null;
    }

    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);

    // Save family (add/edit) with AJAX
    saveBtn.addEventListener('click', function() {
        if (!familyForm.checkValidity()) {
            familyForm.reportValidity();
            return;
        }

        const formData = {
            family_id: document.getElementById('family-id').value,
            family_name: document.getElementById('family-name').value,
            address: document.getElementById('address').value,
            head_of_family: document.getElementById('head-of-family').value,
            members_count: parseInt(document.getElementById('members-count').value),
            editing: editingFamilyId ? 1 : 0
        };

        fetch('dont%20touch%20it/family-handler.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadFamilies();
                closeModal();
                alert(data.message);
            } else {
                alert('Error: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Something went wrong.');
        });
    });

    // Edit family
    function editFamily(familyId) {
    fetch(`dont touch it/family-handler.php?action=get&family_id=${familyId}`)
        .then(res => res.json())
        .then(family => {
            if (family) {
                editingFamilyId = familyId;
                modalTitle.textContent = 'Edit Family';
                document.getElementById('family-id').value = family.Family_ID;
                document.getElementById('family-name').value = family.Family_Name;
                document.getElementById('address').value = family.Address;
                document.getElementById('head-of-family').value = family.Head_of_Family_Name || ''; // <--- fix here
                modal.style.display = 'flex';
            } else {
                alert('Family not found.');
            }
        })
        .catch(err => {
            console.error('Error fetching family:', err);
            alert('Failed to fetch family details.');
        });
}

    // Delete family
    function deleteFamily(familyId) {
        if (confirm('Are you sure you want to delete this family? This will also remove all associated residents.')) {
            fetch('family_handler.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ family_id: familyId, delete: 1 })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    loadFamilies();
                    alert(data.message);
                } else {
                    alert('Error: ' + data.message);
                }
            });
        }
    }

    // Filter functionality
    filterToggleBtn.addEventListener('click', function() {
        filterSection.style.display = filterSection.style.display === 'none' ? 'block' : 'none';
    });

    applyFiltersBtn.addEventListener('click', function() {
        currentFilters = {
            familyId: document.getElementById('filter-family-id').value.toLowerCase(),
            familyName: document.getElementById('filter-family-name').value.toLowerCase(),
            address: document.getElementById('filter-address').value.toLowerCase()
        };
        loadFamilies();
    });

    clearFiltersBtn.addEventListener('click', function() {
        document.getElementById('filter-family-id').value = '';
        document.getElementById('filter-family-name').value = '';
        document.getElementById('filter-address').value = '';
        currentFilters = {};
        loadFamilies();
    });

    // Load families from database
    function loadFamilies() {
    fetch('dont%20touch%20it/family-handler.php?action=fetch')
    .then(res => res.json())
    .then(families => {
        const tableBody = document.getElementById('families-table-body');
        tableBody.innerHTML = '';

        const filteredFamilies = families.filter(family => {
            if (currentFilters.familyId && !family.Family_ID.toString().toLowerCase().includes(currentFilters.familyId)) return false;
            if (currentFilters.familyName && !family.Family_Name.toLowerCase().includes(currentFilters.familyName)) return false;
            if (currentFilters.address && !family.Address.toLowerCase().includes(currentFilters.address)) return false;
            return true;
        });

        if (filteredFamilies.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="empty-state-cell">No family records match. Add a family or adjust your filters.</td></tr>';
            return;
        }

        filteredFamilies.forEach(family => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${family.Family_ID}</td>
                <td>${family.Family_Name}</td>
                <td>${family.Address}</td>
                <td>${family.Head_of_Family_Name || '—'}</td>
                <td>
                    <div class="action-buttons-cell">
                        <button class="action-btn btn-warning" onclick="editFamily(${family.Family_ID})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn btn-danger" onclick="deleteFamily(${family.Family_ID})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    })
    .catch(error => {
        console.error('Unable to load family records:', error);
        document.getElementById('families-table-body').innerHTML =
            '<tr><td colspan="5" class="empty-state-cell">Family records could not be loaded. Check the connection and refresh the page.</td></tr>';
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
        if (window.innerWidth <= 768 && sidebar.classList.contains('active') && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
            sidebar.classList.remove('active');
        }
    });

    // Initialize the page
    document.addEventListener('DOMContentLoaded', function() {
        const user = checkAuth();
        if (user) {
            updateUserInterface(user);
            loadFamilies();
        }
    });
</script>
</body>
</html>