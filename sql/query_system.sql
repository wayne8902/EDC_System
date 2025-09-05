-- ========================================
-- EDC Query 系統資料庫建置計畫
-- ========================================
-- 建立時間: 2025-01-15
-- 說明: 用於存儲和管理 EDC 系統中的 Query 資料

-- 設定字符集和時區
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;

-- ========================================
-- 1. 主要 Query 資料表
-- ========================================

DROP TABLE IF EXISTS `queries`;
CREATE TABLE `queries` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'Query ID (主鍵)',
  `batch_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '批次ID (UUID)',
  `subject_code` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '受試者編號',
  `batch_data` json NOT NULL COMMENT '完整批量 Query 資料 (JSON格式)',
  `query_count` int NOT NULL DEFAULT 1 COMMENT 'Query 數量',
  `status` enum('pending','in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '整體狀態',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '發起者 (UNIQUE_ID)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '發起時間',
  `assigned_to` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '指派給 (UNIQUE_ID)',
  `assigned_at` timestamp NULL DEFAULT NULL COMMENT '指派時間',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成時間',
  `due_date` date DEFAULT NULL COMMENT '截止日期',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '備註',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最後更新時間',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_batch_id` (`batch_id`),
  KEY `idx_subject_code` (`subject_code`),
  KEY `idx_status` (`status`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_status_created` (`status`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Query 主資料表';

-- ========================================
-- 2. Query 回應記錄表
-- ========================================

DROP TABLE IF EXISTS `query_responses`;
CREATE TABLE `query_responses` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '回應ID',
  `batch_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '對應的批次ID',
  `field_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '欄位名稱',
  `table_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '資料表名稱',
  `original_question` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '原始問題',
  `response_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '回應內容',
  `response_type` enum('clarification','correction','no_action','escalation') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '回應類型',
  `original_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '原始值',
  `corrected_value` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '修正後的值',
  `status` enum('open','responded','resolved','closed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open' COMMENT '單項狀態',
  `responded_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '回應者 (UNIQUE_ID)',
  `responded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '回應時間',
  `attachments` json DEFAULT NULL COMMENT '附件資訊 (JSON格式)',
  PRIMARY KEY (`id`),
  KEY `idx_batch_id` (`batch_id`),
  KEY `idx_field_table` (`field_name`, `table_name`),
  KEY `idx_status` (`status`),
  KEY `idx_responded_by` (`responded_by`),
  KEY `idx_responded_at` (`responded_at`),
  FOREIGN KEY (`batch_id`) REFERENCES `queries` (`batch_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Query 回應記錄表';

-- ========================================
-- 3. Query 狀態變更歷史表
-- ========================================

DROP TABLE IF EXISTS `query_status_history`;
CREATE TABLE `query_status_history` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '歷史記錄ID',
  `batch_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '批次ID',
  `old_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '舊狀態',
  `new_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '新狀態',
  `changed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作者 (UNIQUE_ID)',
  `changed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '變更時間',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '變更原因',
  PRIMARY KEY (`id`),
  KEY `idx_batch_id` (`batch_id`),
  KEY `idx_changed_by` (`changed_by`),
  KEY `idx_changed_at` (`changed_at`),
  FOREIGN KEY (`batch_id`) REFERENCES `queries` (`batch_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Query 狀態變更歷史表';

-- ========================================
-- 4. Query 統計檢視表
-- ========================================

CREATE OR REPLACE VIEW `query_statistics` AS
SELECT 
    DATE(created_at) as date,
    status,
    created_by,
    COUNT(*) as query_count,
    SUM(query_count) as total_questions,
    AVG(TIMESTAMPDIFF(HOUR, created_at, completed_at)) as avg_completion_hours
FROM queries 
GROUP BY DATE(created_at), status, created_by;

-- ========================================
-- 5. 更新 config 表，加入 Query 系統配置
-- ========================================

-- 為 Query 系統添加配置項目
INSERT INTO `config` (`ID`, `VALUE`) VALUES
('column_id_queries', 'id,batch_id,subject_code,batch_data,query_count,status,created_by,created_at,assigned_to,assigned_at,completed_at,due_date,notes,updated_at'),
('column_id_query_responses', 'id,batch_id,field_name,table_name,original_question,response_text,response_type,original_value,corrected_value,status,responded_by,responded_at,attachments'),
('column_id_query_status_history', 'id,batch_id,old_status,new_status,changed_by,changed_at,reason'),
('query_system_settings', '{"auto_assign":true,"default_due_days":7,"notification_enabled":true,"escalation_hours":48}')
ON DUPLICATE KEY UPDATE `VALUE` = VALUES(`VALUE`);

-- ========================================
-- 6. 建立觸發器 (自動記錄狀態變更)
-- ========================================

DELIMITER $$

CREATE TRIGGER `queries_status_change_log` 
AFTER UPDATE ON `queries`
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO `query_status_history` 
        (`batch_id`, `old_status`, `new_status`, `changed_by`, `reason`)
        VALUES 
        (NEW.batch_id, OLD.status, NEW.status, NEW.created_by, 'Status updated');
    END IF;
END$$

DELIMITER ;

-- ========================================
-- 7. 建立索引優化查詢效能
-- ========================================

-- 複合索引：支援常見查詢模式
CREATE INDEX `idx_subject_status_date` ON `queries` (`subject_code`, `status`, `created_at`);
CREATE INDEX `idx_assigned_status` ON `queries` (`assigned_to`, `status`);
CREATE INDEX `idx_batch_field_status` ON `query_responses` (`batch_id`, `field_name`, `status`);

-- 全文索引：支援內容搜尋
-- ALTER TABLE `queries` ADD FULLTEXT(`notes`);
-- ALTER TABLE `query_responses` ADD FULLTEXT(`original_question`, `response_text`);

-- ========================================
-- 8. 插入測試資料
-- ========================================

-- 測試用 Query 資料
INSERT INTO `queries` (
    `batch_id`, 
    `subject_code`, 
    `batch_data`, 
    `query_count`, 
    `created_by`, 
    `notes`
) VALUES 
(
    'test-batch-001',
    'P010007',
    JSON_OBJECT(
        'subject_code', 'P010007',
        'queries', JSON_ARRAY(
            JSON_OBJECT(
                'table_name', 'subjects',
                'field_name', 'age',
                'query_type', 'clarification',
                'expected_value', '',
                'question', '年齡與出生日期不符，請確認計算方式',
                'current_value', '25'
            ),
            JSON_OBJECT(
                'table_name', 'subjects',
                'field_name', 'height_cm',
                'query_type', 'verification',
                'expected_value', '',
                'question', '身高數值異常，請重新測量確認',
                'current_value', '175.0'
            ),
            JSON_OBJECT(
                'table_name', 'subjects',
                'field_name', 'bmi',
                'query_type', 'correction',
                'expected_value', '24.3',
                'question', 'BMI計算結果與身高體重不符，請修正',
                'current_value', '22.9'
            )
        )
    ),
    3,
    'khh00001',
    '批量 Query 測試資料'
);

COMMIT;

-- ========================================
-- 建置完成
-- ========================================
-- 
-- 使用說明:
-- 1. 執行此 SQL 檔案建立 Query 系統資料表
-- 2. batch_data 欄位存儲完整的 batchData JSON
-- 3. 支援批量 Query 的完整生命週期管理
-- 4. 提供統計和歷史追蹤功能
-- 
-- 主要特色:
-- - JSON 欄位存儲複雜資料結構
-- - 完整的狀態管理和歷史記錄
-- - 高效的索引設計
-- - 自動觸發器記錄狀態變更
--
