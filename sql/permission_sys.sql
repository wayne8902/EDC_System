-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- 主機： localhost:3306
-- 產生時間： 2025 年 09 月 05 日 09:59
-- 伺服器版本： 8.0.43-0ubuntu0.24.04.1
-- PHP 版本： 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 資料庫： `permission_sys`
--

-- --------------------------------------------------------

--
-- 資料表結構 `Audit_logs`
--

CREATE TABLE `Audit_logs` (
  `id` bigint NOT NULL,
  `user_unique_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作用戶的 UNIQUE_ID',
  `action` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作類型',
  `permission` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '相關權限',
  `result` tinyint(1) DEFAULT NULL COMMENT '操作結果：TRUE=成功, FALSE=失敗',
  `details` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '詳細資訊，JSON格式',
  `ip_address` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '客戶端IP地址',
  `user_agent` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '用戶代理字串',
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='權限系統審計日誌表';

-- --------------------------------------------------------

--
-- 資料表結構 `config`
--

CREATE TABLE `config` (
  `INDEXNUMBER` int NOT NULL,
  `ID` text NOT NULL,
  `VALUE` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `config`
--

INSERT INTO `config` (`INDEXNUMBER`, `ID`, `VALUE`) VALUES
(1, 'column_id_permission', 'id,name,resource,action,description,created_at');

-- --------------------------------------------------------

--
-- 資料表結構 `Permissions`
--

CREATE TABLE `Permissions` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '權限名稱，如: users.create',
  `resource` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '資源類型，如: users, roles',
  `action` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作類型，如: create, read, update, delete',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '權限描述',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='權限定義表';

--
-- 傾印資料表的資料 `Permissions`
--

INSERT INTO `Permissions` (`id`, `name`, `resource`, `action`, `description`, `created_at`) VALUES
(1, 'users.view', 'users', 'view', '查看用戶列表', '2025-08-22 04:19:25'),
(2, 'users.create', 'users', 'create', '建立新用戶', '2025-08-22 04:19:25'),
(3, 'users.edit', 'users', 'edit', '編輯用戶資料', '2025-08-22 04:19:25'),
(4, 'users.delete', 'users', 'delete', '刪除用戶', '2025-08-22 04:19:25'),
(5, 'users.admin', 'users', 'admin', '用戶管理員權限', '2025-08-22 04:19:25'),
(6, 'roles.view', 'roles', 'view', '查看角色列表', '2025-08-22 04:19:25'),
(7, 'roles.create', 'roles', 'create', '建立新角色', '2025-08-22 04:19:25'),
(8, 'roles.edit', 'roles', 'edit', '編輯角色', '2025-08-22 04:19:25'),
(9, 'roles.delete', 'roles', 'delete', '刪除角色', '2025-08-22 04:19:25'),
(10, 'roles.assign', 'roles', 'assign', '分配角色給用戶', '2025-08-22 04:19:25'),
(11, 'permissions.view', 'permissions', 'view', '查看權限列表', '2025-08-22 04:19:25'),
(12, 'permissions.grant', 'permissions', 'grant', '授予權限', '2025-08-22 04:19:25'),
(13, 'permissions.revoke', 'permissions', 'revoke', '撤銷權限', '2025-08-22 04:19:25'),
(14, 'audit_logs.view', 'audit_logs', 'view', '查看審計日誌', '2025-08-22 04:19:25'),
(15, 'audit_logs.export', 'audit_logs', 'export', '匯出審計日誌', '2025-08-22 04:19:25'),
(16, 'dashboard.view', 'dashboard', 'view', '查看控制台', '2025-08-22 04:19:25'),
(17, 'dashboard.admin', 'dashboard', 'admin', '控制台管理', '2025-08-22 04:19:25'),
(18, 'system.admin', 'system', 'admin', '系統超級管理員權限', '2025-08-22 04:19:25'),
(19, 'system.config', 'system', 'config', '系統配置管理', '2025-08-22 04:19:25'),
(20, 'system.backup', 'system', 'backup', '系統備份', '2025-08-22 04:19:25'),
(21, 'system.maintenance', 'system', 'maintenance', '系統維護模式', '2025-08-22 04:19:25'),
(22, 'edc.data.view', 'edc', 'view', '查看資料', '2025-08-22 04:19:25'),
(23, 'edc.data.create', 'edc', 'create', '新增資料', '2025-08-22 04:19:25'),
(24, 'edc.data.edit', 'edc', 'edit', '編輯資料', '2025-08-22 04:19:25'),
(25, 'edc.data.freeze', 'edc', 'freeze', '資料凍結', '2025-08-22 04:19:25'),
(26, 'edc.query.create', 'edc', 'query_create', '發起 Query', '2025-08-22 04:19:25'),
(27, 'edc.query.view', 'edc', 'query_view', '查看 Query', '2025-08-22 04:19:25'),
(28, 'edc.query.response', 'edc', 'query_response', '回應 Query', '2025-09-05 06:36:08'),
(29, 'edc.crf.sign', 'edc', 'crf_sign', '電子簽署', '2025-08-22 04:19:25'),
(30, 'edc.system.admin', 'edc', 'system_admin', '系統管理', '2025-08-22 04:19:25');

-- --------------------------------------------------------

--
-- 資料表結構 `Roles`
--

CREATE TABLE `Roles` (
  `id` int NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名稱，如: admin, manager',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '角色描述',
  `permissions` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT 'JSON格式的權限名稱陣列',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否啟用',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

--
-- 傾印資料表的資料 `Roles`
--

INSERT INTO `Roles` (`id`, `name`, `description`, `permissions`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'system_admin', 'EDC系統管理員 - 帳號與權限設定，不參與資料輸入與修改', '[\"edc.system.admin\", \"edc.data.view\", \"edc.query.view\"]', 1, '2025-08-22 07:37:50', '2025-09-05 03:51:34'),
(2, 'sponsor', '試驗委託者 - 資料讀取者，資料審查(唯讀)', '[\"edc.data.view\", \"edc.query.view\"]', 1, '2025-08-22 07:37:50', '2025-09-05 03:51:26'),
(3, 'researcher', '研究人員 - 資料編輯者，新增、編輯資料，回應試驗監測者提出的Query', '[\"edc.data.view\", \"edc.data.create\", \"edc.data.edit\", \"edc.query.view\"]', 1, '2025-08-22 07:37:50', '2025-09-05 04:06:57'),
(4, 'investigator', '試驗主持人 - 資料編輯者/電子簽章者，新增、編輯資料，審查並簽屬eCRF', '[\"edc.data.view\", \"edc.data.create\", \"edc.data.edit\", \"edc.crf.sign\", \"edc.query.view\"]', 1, '2025-08-22 07:37:50', '2025-09-05 04:08:50'),
(5, 'monitor', '試驗監測者 - 資料審核者/Query發起者，資料審查與凍結(唯讀處理)', '[\"edc.data.view\", \"edc.data.freeze\", \"edc.query.create\", \"edc.query.view\"]', 1, '2025-08-22 07:37:50', '2025-08-22 07:38:18');

-- --------------------------------------------------------

--
-- 資料表結構 `User_permissions`
--

CREATE TABLE `User_permissions` (
  `id` int NOT NULL,
  `UNIQUE_ID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '參考 user.UNIQUE_ID',
  `permission_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '權限名稱',
  `granted_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '授權者的 UNIQUE_ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶直接權限表';

-- --------------------------------------------------------

--
-- 資料表結構 `User_roles`
--

CREATE TABLE `User_roles` (
  `id` int NOT NULL,
  `UNIQUE_ID` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '參考 user.UNIQUE_ID',
  `role_id` int NOT NULL COMMENT '參考 rbac_roles.id',
  `assigned_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '分配者的 UNIQUE_ID',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶角色關聯表';

--
-- 傾印資料表的資料 `User_roles`
--

INSERT INTO `User_roles` (`id`, `UNIQUE_ID`, `role_id`, `assigned_by`, `created_at`) VALUES
(5, 'khh00000', 3, 'system', '2025-08-22 07:39:12'),
(6, 'khh00001', 4, 'system', '2025-08-22 07:39:12'),
(7, 'khh00002', 5, 'system', '2025-08-22 07:39:12');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `Audit_logs`
--
ALTER TABLE `Audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_unique_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_timestamp` (`timestamp`),
  ADD KEY `idx_permission` (`permission`),
  ADD KEY `idx_result` (`result`);

--
-- 資料表索引 `config`
--
ALTER TABLE `config`
  ADD PRIMARY KEY (`INDEXNUMBER`);

--
-- 資料表索引 `Permissions`
--
ALTER TABLE `Permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_resource` (`resource`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_name` (`name`);

--
-- 資料表索引 `Roles`
--
ALTER TABLE `Roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `idx_name` (`name`),
  ADD KEY `idx_active` (`is_active`);

--
-- 資料表索引 `User_permissions`
--
ALTER TABLE `User_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_permission` (`UNIQUE_ID`,`permission_name`),
  ADD KEY `idx_user` (`UNIQUE_ID`),
  ADD KEY `idx_permission` (`permission_name`),
  ADD KEY `idx_granted_by` (`granted_by`);

--
-- 資料表索引 `User_roles`
--
ALTER TABLE `User_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_role` (`UNIQUE_ID`,`role_id`),
  ADD KEY `idx_user` (`UNIQUE_ID`),
  ADD KEY `idx_role` (`role_id`),
  ADD KEY `idx_assigned_by` (`assigned_by`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `Audit_logs`
--
ALTER TABLE `Audit_logs`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `Permissions`
--
ALTER TABLE `Permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `Roles`
--
ALTER TABLE `Roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `User_permissions`
--
ALTER TABLE `User_permissions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `User_roles`
--
ALTER TABLE `User_roles`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `User_roles`
--
ALTER TABLE `User_roles`
  ADD CONSTRAINT `User_roles_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `Roles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
