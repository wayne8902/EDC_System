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
-- 資料庫： `edc_sys`
--

-- --------------------------------------------------------

--
-- 資料表結構 `config`
--

CREATE TABLE `config` (
  `INDEXNUMBER` int NOT NULL,
  `ID` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `VALUE` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- 傾印資料表的資料 `config`
--

INSERT INTO `config` (`INDEXNUMBER`, `ID`, `VALUE`) VALUES
(1, 'column_id_subjects', 'id,subject_code,date_of_birth,age,gender,height_cm,weight_kg,bmi,scr,egfr,ph,sg,rbc,bac,dm,gout,imaging_type,imaging_date,kidney_stone_diagnosis,imaging_files,imaging_report_summary,signature_hash,log,status,created_by,created_at,updated_by,updated_at,signed_by,signed_at'),
(2, 'column_id_inclusion_criteria', 'id,subject_code,age_18_above,gender_available,age_available,bmi_available,dm_history_available,gout_history_available,egfr_available,urine_ph_available,urine_sg_available,urine_rbc_available,bacteriuria_available,lab_interval_7days,imaging_available,kidney_structure_visible,mid_ureter_visible,lower_ureter_visible,imaging_lab_interval_7days,no_treatment_during_exam,medications,surgeries,signature_hash,log,status,created_by,created_at,updated_by,updated_at,signed_by,signed_at'),
(3, 'column_id_exclusion_criteria', 'id,subject_code,pregnant_female,kidney_transplant,urinary_tract_foreign_body,urinary_tract_foreign_body_type,non_stone_urological_disease,non_stone_urological_disease_type,renal_replacement_therapy,renal_replacement_therapy_type,medical_record_incomplete,major_blood_immune_cancer,major_blood_immune_cancer_type,rare_metabolic_disease,rare_metabolic_disease_type,investigator_judgment,judgment_reason,signature_hash,log,status,created_by,created_at,updated_by,updated_at,signed_by,signed_at'),
(4, 'column_id_queries', 'id,batch_id,subject_code,batch_data,query_count,status,created_by,created_at,assigned_to,assigned_at,completed_at,due_date,notes,updated_at'),
(5, 'column_id_query_responses', 'id,batch_id,field_name,table_name,original_question,response_text,response_type,original_value,corrected_value,status,responded_by,responded_at,attachments'),
(6, 'column_id_query_status_history', 'id,batch_id,old_status,new_status,changed_by,changed_at,reason'),
(7, 'query_system_settings', '{\"auto_assign\":true,\"default_due_days\":7,\"notification_enabled\":true,\"escalation_hours\":48}');

-- --------------------------------------------------------

--
-- 資料表結構 `edit_log`
--

CREATE TABLE `edit_log` (
  `id` int NOT NULL,
  `log_id` varchar(7) DEFAULT NULL,
  `subject_code` varchar(20) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `field_name` varchar(100) NOT NULL,
  `old_value` text,
  `new_value` text,
  `action` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- 資料表結構 `exclusion_criteria`
--

CREATE TABLE `exclusion_criteria` (
  `id` int NOT NULL COMMENT '排除條件ID',
  `subject_code` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '受試者編號',
  `pregnant_female` int DEFAULT NULL COMMENT '患者是否為懷孕女性?(0=否,1=是)',
  `kidney_transplant` int DEFAULT NULL COMMENT '患者是否接受過腎臟移植?(0=否,1=是)',
  `urinary_tract_foreign_body` int DEFAULT NULL COMMENT '患者是否為合併泌尿道異物者?(0=否,1=是)',
  `urinary_tract_foreign_body_type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '泌尿道異物種類名稱',
  `non_stone_urological_disease` int DEFAULT NULL COMMENT '患者是否患有合併非腎結石相關之泌尿系統重大病變?(0=否,1=是)',
  `non_stone_urological_disease_type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '非腎結石相關之泌尿道重大病變名稱',
  `renal_replacement_therapy` int DEFAULT NULL COMMENT '患者是否正在接受腎臟替代治療?(0=否,1=是)',
  `renal_replacement_therapy_type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '腎臟替代治療名稱',
  `medical_record_incomplete` int DEFAULT NULL COMMENT '患者是否有病歷資料缺失或無腎結石診斷依據?(0=否,1=是)',
  `major_blood_immune_cancer` int DEFAULT NULL COMMENT '患者是否患有合併重大血液、免疫或惡性腫瘤疾病?(0=否,1=是)',
  `major_blood_immune_cancer_type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '重大血液、免疫或惡性腫瘤疾病名稱',
  `rare_metabolic_disease` int DEFAULT NULL COMMENT '患者是否患有合併罕見代謝性疾病?(0=否,1=是)',
  `rare_metabolic_disease_type` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '罕見代謝性疾病名稱',
  `investigator_judgment` int DEFAULT NULL COMMENT '患者是否經試驗主持人專業判斷認定不適合納入本研究?(0=否,1=是)',
  `judgment_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '試驗主持人認定不適合納入本研究之原因',
  `signature_hash` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted','signed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間',
  `signed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排除條件評估表';

-- --------------------------------------------------------

--
-- 資料表結構 `inclusion_criteria`
--

CREATE TABLE `inclusion_criteria` (
  `id` int NOT NULL COMMENT '納入條件ID',
  `subject_code` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '受試者編號',
  `age_18_above` int NOT NULL COMMENT '患者年齡是否18歲(含)以上?(0=否,1=是)',
  `gender_available` int NOT NULL COMMENT '病歷中是否記載性別?(0=否,1=是)',
  `age_available` int NOT NULL COMMENT '病歷中是否記載年齡?(0=否,1=是)',
  `bmi_available` int NOT NULL COMMENT '病歷中是否記載BMI?(0=否,1=是)',
  `dm_history_available` int NOT NULL COMMENT '病歷中是否記載糖尿病病史?(0=否,1=是)',
  `gout_history_available` int NOT NULL COMMENT '病歷中是否記載痛風病史?(0=否,1=是)',
  `egfr_available` int NOT NULL COMMENT '病歷中是否具備eGFR檢驗資料?(0=否,1=是)',
  `urine_ph_available` int NOT NULL COMMENT '病歷中是否具備尿液pH檢驗資料?(0=否,1=是)',
  `urine_sg_available` int NOT NULL COMMENT '病歷中是否具備尿液SG檢驗資料?(0=否,1=是)',
  `urine_rbc_available` int NOT NULL COMMENT '病歷中是否具備尿液RBC counts檢驗資料?(0=否,1=是)',
  `bacteriuria_available` int NOT NULL COMMENT '病歷中是否具備菌尿症檢驗資料?(0=否,1=是)',
  `lab_interval_7days` int NOT NULL COMMENT '各檢驗項目採檢時間間隔是否皆未超過7天?(0=否,1=是)',
  `imaging_available` int NOT NULL COMMENT '病歷中是否記錄腹部CT或PET-CT影像資料?(0=否,1=是)',
  `kidney_structure_visible` int NOT NULL COMMENT '影像資料是否可完整顯現腎臟結構?(0=否,1=是)',
  `mid_ureter_visible` int NOT NULL COMMENT '影像資料是否可完整顯現中段輸尿管結構?(0=否,1=是)',
  `lower_ureter_visible` int NOT NULL COMMENT '影像資料是否可完整顯現下段輸尿管結構?(0=否,1=是)',
  `imaging_lab_interval_7days` int NOT NULL COMMENT '影像檢查與檢驗資料時間間隔是否皆未超過7天?(0=否,1=是)',
  `no_treatment_during_exam` int NOT NULL COMMENT '檢查期間是否無任何治療處置紀錄?(0=否,1=是)',
  `medications` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '藥物治療記錄(JSON格式)',
  `surgeries` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '手術治療記錄(JSON格式)',
  `signature_hash` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted','signed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間',
  `signed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='納入條件評估表';

-- --------------------------------------------------------

--
-- 資料表結構 `queries`
--

CREATE TABLE `queries` (
  `id` int NOT NULL COMMENT 'Query ID (主鍵)',
  `batch_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '批次ID (UUID)',
  `subject_code` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '受試者編號',
  `batch_data` json NOT NULL COMMENT '完整批量 Query 資料 (JSON格式)',
  `query_count` int NOT NULL DEFAULT '1' COMMENT 'Query 數量',
  `status` enum('pending','in_progress','completed','cancelled') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '整體狀態',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '發起者 (UNIQUE_ID)',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '發起時間',
  `assigned_to` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '指派給 (UNIQUE_ID)',
  `assigned_at` timestamp NULL DEFAULT NULL COMMENT '指派時間',
  `completed_at` timestamp NULL DEFAULT NULL COMMENT '完成時間',
  `due_date` date DEFAULT NULL COMMENT '截止日期',
  `notes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '備註',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最後更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Query 主資料表';

--
-- 傾印資料表的資料 `queries`
--

INSERT INTO `queries` (`id`, `batch_id`, `subject_code`, `batch_data`, `query_count`, `status`, `created_by`, `created_at`, `assigned_to`, `assigned_at`, `completed_at`, `due_date`, `notes`, `updated_at`) VALUES
(1, 'test-batch-001', 'P010007', '{\"queries\": [{\"question\": \"年齡與出生日期不符，請確認計算方式\", \"field_name\": \"age\", \"query_type\": \"clarification\", \"table_name\": \"subjects\", \"current_value\": \"25\", \"expected_value\": \"\"}, {\"question\": \"身高數值異常，請重新測量確認\", \"field_name\": \"height_cm\", \"query_type\": \"verification\", \"table_name\": \"subjects\", \"current_value\": \"175.0\", \"expected_value\": \"\"}, {\"question\": \"BMI計算結果與身高體重不符，請修正\", \"field_name\": \"bmi\", \"query_type\": \"correction\", \"table_name\": \"subjects\", \"current_value\": \"22.9\", \"expected_value\": \"24.3\"}], \"subject_code\": \"P010007\"}', 3, 'pending', 'khh00001', '2025-09-04 01:21:18', NULL, NULL, NULL, NULL, '批量 Query 測試資料', '2025-09-04 01:21:18'),
(2, 'B2025090411102065c997cd', 'P010006', '{\"queries\": [{\"question\": \"測試\", \"field_name\": \"age\", \"query_type\": \"clarification\", \"table_name\": \"subjects\", \"current_value\": \"35\", \"expected_value\": \"36\"}, {\"question\": \"測試\", \"field_name\": \"pregnant_female\", \"query_type\": \"clarification\", \"table_name\": \"exclusion_criteria\", \"current_value\": \"0\", \"expected_value\": \"1\"}], \"subject_code\": \"P010006\"}', 2, 'pending', 'khh00002', '2025-09-04 03:10:20', NULL, NULL, NULL, NULL, NULL, '2025-09-04 03:10:20'),
(3, 'B202509051103145e2bc7c0', 'P010004', '{\"queries\": [{\"question\": \"測試\", \"field_name\": \"height_cm\", \"query_type\": \"clarification\", \"table_name\": \"subjects\", \"current_value\": \"169.9\", \"expected_value\": \"165\"}], \"subject_code\": \"P010004\"}', 1, 'pending', 'khh00002', '2025-09-05 03:03:14', NULL, NULL, NULL, NULL, NULL, '2025-09-05 03:03:14'),
(4, 'B20250905110458d839e935', 'P010006', '{\"queries\": [{\"question\": \"測試\", \"field_name\": \"age_18_above\", \"query_type\": \"clarification\", \"table_name\": \"inclusion_criteria\", \"current_value\": \"1\", \"expected_value\": \"0\"}], \"subject_code\": \"P010006\"}', 1, 'pending', 'khh00002', '2025-09-05 03:04:58', NULL, NULL, NULL, NULL, NULL, '2025-09-05 03:04:58');

--
-- 觸發器 `queries`
--
DELIMITER $$
CREATE TRIGGER `queries_status_change_log` AFTER UPDATE ON `queries` FOR EACH ROW BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO `query_status_history` 
        (`batch_id`, `old_status`, `new_status`, `changed_by`, `reason`)
        VALUES 
        (NEW.batch_id, OLD.status, NEW.status, NEW.created_by, 'Status updated');
    END IF;
END$$
DELIMITER ;

-- --------------------------------------------------------

--
-- 資料表結構 `query_responses`
--

CREATE TABLE `query_responses` (
  `id` int NOT NULL COMMENT '回應ID',
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
  `attachments` json DEFAULT NULL COMMENT '附件資訊 (JSON格式)'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Query 回應記錄表';

-- --------------------------------------------------------

--
-- 替換檢視表以便查看 `query_statistics`
-- (請參考以下實際畫面)
--

-- --------------------------------------------------------

--
-- 資料表結構 `query_status_history`
--

CREATE TABLE `query_status_history` (
  `id` int NOT NULL COMMENT '歷史記錄ID',
  `batch_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '批次ID',
  `old_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '舊狀態',
  `new_status` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '新狀態',
  `changed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作者 (UNIQUE_ID)',
  `changed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '變更時間',
  `reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '變更原因'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Query 狀態變更歷史表';

-- --------------------------------------------------------

--
-- 資料表結構 `subjects`
--

CREATE TABLE `subjects` (
  `id` int NOT NULL COMMENT '受試者ID',
  `subject_code` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '受試者編號',
  `date_of_birth` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '出生日期',
  `age` int DEFAULT NULL COMMENT '年齡(計算欄位)',
  `gender` int NOT NULL COMMENT '性別(0=女,1=男)',
  `height_cm` float DEFAULT NULL COMMENT '身高(cm)',
  `weight_kg` float DEFAULT NULL COMMENT '體重(kg)',
  `bmi` float DEFAULT NULL COMMENT 'BMI(計算欄位)',
  `scr` float DEFAULT NULL,
  `egfr` float DEFAULT NULL,
  `ph` float DEFAULT NULL,
  `sg` float DEFAULT NULL,
  `rbc` float DEFAULT NULL,
  `bac` int DEFAULT NULL COMMENT '菌尿症(0=無,1=有)',
  `dm` int DEFAULT NULL COMMENT '糖尿病(0=無,1=有)',
  `gout` int DEFAULT NULL COMMENT '痛風(0=無,1=有)',
  `imaging_type` enum('CT','PET-CT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '影像檢查類型',
  `imaging_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '影像檢查日期',
  `kidney_stone_diagnosis` int DEFAULT NULL COMMENT '腎結石診斷結果',
  `imaging_files` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '影像報告上傳檔案路徑(JSON格式)',
  `imaging_report_summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '影像伴讀報告摘要',
  `signature_hash` varchar(256) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','query','submitted','signed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間',
  `signed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='受試者資料表';

-- --------------------------------------------------------

--
-- 檢視表結構 `query_statistics`
--
DROP TABLE IF EXISTS `query_statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `query_statistics`  AS SELECT cast(`queries`.`created_at` as date) AS `date`, `queries`.`status` AS `status`, `queries`.`created_by` AS `created_by`, count(0) AS `query_count`, sum(`queries`.`query_count`) AS `total_questions`, avg(timestampdiff(HOUR,`queries`.`created_at`,`queries`.`completed_at`)) AS `avg_completion_hours` FROM `queries` GROUP BY cast(`queries`.`created_at` as date), `queries`.`status`, `queries`.`created_by` ;

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `config`
--
ALTER TABLE `config`
  ADD PRIMARY KEY (`INDEXNUMBER`);

--
-- 資料表索引 `edit_log`
--
ALTER TABLE `edit_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_subject_code` (`subject_code`),
  ADD KEY `idx_log_id` (`log_id`),
  ADD KEY `idx_table_field` (`table_name`,`field_name`);

--
-- 資料表索引 `exclusion_criteria`
--
ALTER TABLE `exclusion_criteria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_subject_exclusion` (`subject_code`);

--
-- 資料表索引 `inclusion_criteria`
--
ALTER TABLE `inclusion_criteria`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_subject_criteria` (`subject_code`);

--
-- 資料表索引 `queries`
--
ALTER TABLE `queries`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_batch_id` (`batch_id`),
  ADD KEY `idx_subject_code` (`subject_code`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_status_created` (`status`,`created_at`),
  ADD KEY `idx_subject_status_date` (`subject_code`,`status`,`created_at`),
  ADD KEY `idx_assigned_status` (`assigned_to`,`status`);

--
-- 資料表索引 `query_responses`
--
ALTER TABLE `query_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_batch_id` (`batch_id`),
  ADD KEY `idx_field_table` (`field_name`,`table_name`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_responded_by` (`responded_by`),
  ADD KEY `idx_responded_at` (`responded_at`),
  ADD KEY `idx_batch_field_status` (`batch_id`,`field_name`,`status`);

--
-- 資料表索引 `query_status_history`
--
ALTER TABLE `query_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_batch_id` (`batch_id`),
  ADD KEY `idx_changed_by` (`changed_by`),
  ADD KEY `idx_changed_at` (`changed_at`);

--
-- 資料表索引 `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_subject_code` (`subject_code`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `config`
--
ALTER TABLE `config`
  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `edit_log`
--
ALTER TABLE `edit_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=212;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `exclusion_criteria`
--
ALTER TABLE `exclusion_criteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '排除條件ID', AUTO_INCREMENT=45;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `inclusion_criteria`
--
ALTER TABLE `inclusion_criteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '納入條件ID', AUTO_INCREMENT=46;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `queries`
--
ALTER TABLE `queries`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT 'Query ID (主鍵)', AUTO_INCREMENT=5;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `query_responses`
--
ALTER TABLE `query_responses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '回應ID';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `query_status_history`
--
ALTER TABLE `query_status_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '歷史記錄ID';

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '受試者ID', AUTO_INCREMENT=46;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `query_responses`
--
ALTER TABLE `query_responses`
  ADD CONSTRAINT `query_responses_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `queries` (`batch_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `query_status_history`
--
ALTER TABLE `query_status_history`
  ADD CONSTRAINT `query_status_history_ibfk_1` FOREIGN KEY (`batch_id`) REFERENCES `queries` (`batch_id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
