-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- 主機： localhost:3306
-- 產生時間： 2025 年 08 月 27 日 09:18
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
(1, 'column_id_subjects', 'id,subject_code,date_of_birth,age,gender,height_cm,weight_kg,bmi,bac,dm,gout,imaging_type,imaging_date,kidney_stone_diagnosis,imaging_files,imaging_report_summary,created_by,created_at,updated_by,updated_at');

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
  `non_stone_urological_disease_type` text COLLATE utf8mb4_unicode_ci COMMENT '非腎結石相關之泌尿道重大病變名稱',
  `renal_replacement_therapy` int DEFAULT NULL COMMENT '患者是否正在接受腎臟替代治療?(0=否,1=是)',
  `renal_replacement_therapy_type` text COLLATE utf8mb4_unicode_ci COMMENT '腎臟替代治療名稱',
  `medical_record_incomplete` int DEFAULT NULL COMMENT '患者是否有病歷資料缺失或無腎結石診斷依據?(0=否,1=是)',
  `major_blood_immune_cancer` int DEFAULT NULL COMMENT '患者是否患有合併重大血液、免疫或惡性腫瘤疾病?(0=否,1=是)',
  `major_blood_immune_cancer_type` text COLLATE utf8mb4_unicode_ci COMMENT '重大血液、免疫或惡性腫瘤疾病名稱',
  `rare_metabolic_disease` int DEFAULT NULL COMMENT '患者是否患有合併罕見代謝性疾病?(0=否,1=是)',
  `rare_metabolic_disease_type` text COLLATE utf8mb4_unicode_ci COMMENT '罕見代謝性疾病名稱',
  `investigator_judgment` int DEFAULT NULL COMMENT '患者是否經試驗主持人專業判斷認定不適合納入本研究?(0=否,1=是)',
  `judgment_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '試驗主持人認定不適合納入本研究之原因',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排除條件評估表';

--
-- 傾印資料表的資料 `exclusion_criteria`
--

INSERT INTO `exclusion_criteria` (`id`, `subject_code`, `pregnant_female`, `kidney_transplant`, `urinary_tract_foreign_body`, `urinary_tract_foreign_body_type`, `non_stone_urological_disease`, `non_stone_urological_disease_type`, `renal_replacement_therapy`, `renal_replacement_therapy_type`, `medical_record_incomplete`, `major_blood_immune_cancer`, `major_blood_immune_cancer_type`, `rare_metabolic_disease`, `rare_metabolic_disease_type`, `investigator_judgment`, `judgment_reason`, `created_by`, `created_at`, `updated_by`, `updated_at`) VALUES
(2, 'P010002', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, '', 'khh00002', '2025-08-27 09:45:35', NULL, NULL),
(3, 'P010003', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, '', 'khh00002', '2025-08-27 10:11:53', NULL, NULL),
(4, 'P010004', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, '', 'khh00002', '2025-08-27 10:12:14', NULL, NULL),
(5, 'P010005', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, '', 'khh00002', '2025-08-27 12:07:17', NULL, NULL),
(6, 'P010001', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, '', 'khh00002', '2025-08-27 13:41:54', NULL, NULL),
(7, 'P010006', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, '', 'khh00002', '2025-08-27 13:46:46', NULL, NULL),
(8, 'P010012', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, '', 'khh00002', '2025-08-27 14:23:46', NULL, NULL);

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
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='納入條件評估表';

--
-- 傾印資料表的資料 `inclusion_criteria`
--

INSERT INTO `inclusion_criteria` (`id`, `subject_code`, `age_18_above`, `gender_available`, `age_available`, `bmi_available`, `dm_history_available`, `gout_history_available`, `egfr_available`, `urine_ph_available`, `urine_sg_available`, `urine_rbc_available`, `bacteriuria_available`, `lab_interval_7days`, `imaging_available`, `kidney_structure_visible`, `mid_ureter_visible`, `lower_ureter_visible`, `imaging_lab_interval_7days`, `no_treatment_during_exam`, `medications`, `surgeries`, `created_by`, `created_at`, `updated_by`, `updated_at`) VALUES
(2, 'P010002', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, '[{\"date\": \"2025-08-23\", \"name\": \"123123\"}]', '[]', 'khh00002', '2025-08-27 09:45:35', NULL, NULL),
(3, 'P010003', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', 'khh00002', '2025-08-27 10:11:53', NULL, NULL),
(4, 'P010004', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, '[{\"date\": \"2025-08-23\", \"name\": \"123456\"}]', '[]', 'khh00002', '2025-08-27 10:12:14', NULL, NULL),
(5, 'P010005', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', 'khh00002', '2025-08-27 12:07:17', NULL, NULL),
(6, 'P010001', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', 'khh00002', '2025-08-27 13:41:54', NULL, NULL),
(7, 'P010006', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, '[{\"date\": \"2025-08-23\", \"name\": \"123456\"}]', '[]', 'khh00002', '2025-08-27 13:46:46', NULL, NULL),
(8, 'P010012', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', 'khh00002', '2025-08-27 14:23:46', NULL, NULL);

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
  `bac` int DEFAULT NULL COMMENT '菌尿症(0=無,1=有)',
  `dm` int DEFAULT NULL COMMENT '糖尿病(0=無,1=有)',
  `gout` int DEFAULT NULL COMMENT '痛風(0=無,1=有)',
  `imaging_type` enum('CT','PET-CT') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '影像檢查類型',
  `imaging_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '影像檢查日期',
  `kidney_stone_diagnosis` int DEFAULT NULL COMMENT '腎結石診斷結果',
  `imaging_files` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '影像報告上傳檔案路徑(JSON格式)',
  `imaging_report_summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '影像伴讀報告摘要',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='受試者資料表';

--
-- 傾印資料表的資料 `subjects`
--

INSERT INTO `subjects` (`id`, `subject_code`, `date_of_birth`, `age`, `gender`, `height_cm`, `weight_kg`, `bmi`, `bac`, `dm`, `gout`, `imaging_type`, `imaging_date`, `kidney_stone_diagnosis`, `imaging_files`, `imaging_report_summary`, `created_by`, `created_at`, `updated_by`, `updated_at`) VALUES
(2, 'P010002', '1990-01-01', 35, 1, 170.1, 70, 24.193, 1, 1, 1, 'CT', '2025-08-27', 1, '[]', 'DEBUG: 影像檢查報告摘要', 'khh00002', '2025-08-27 09:45:35', NULL, NULL),
(3, 'P010003', '1990-01-01', 35, 1, 170.1, 70, 24.193, 1, 1, 1, 'CT', '2025-08-27', 1, '[]', 'DEBUG: 影像檢查報告摘要', 'khh00002', '2025-08-27 10:11:53', NULL, NULL),
(4, 'P010004', '1990-01-01', 35, 1, 170.1, 70, 24.193, 1, 1, 1, 'CT', '2025-08-27', 1, '[]', 'DEBUG: 影像檢查報告摘要', 'khh00002', '2025-08-27 10:12:14', NULL, NULL),
(5, 'P010005', '1990-01-01', 35, 1, 170.1, 70, 24.193, 0, 0, 0, 'CT', '2025-08-27', 1, '[]', 'DEBUG: 影像檢查報告摘要', 'khh00002', '2025-08-27 12:07:17', NULL, NULL),
(6, 'P010001', '1990-01-01', 35, 1, 170.1, 70, 24.193, 0, 0, 0, 'CT', '2025-08-27', 1, '[]', 'DEBUG: 影像檢查報告摘要', 'khh00002', '2025-08-27 13:41:54', NULL, NULL),
(7, 'P010006', '1990-01-01', 35, 1, 170.1, 70, 24.193, 0, 0, 0, 'CT', '2025-08-27', 1, '[]', 'DEBUG: 影像檢查報告摘要', 'khh00002', '2025-08-27 13:46:46', NULL, NULL),
(8, 'P010012', '1990-01-01', 35, 1, 170.1, 70, 24.193, 0, 0, 0, 'CT', '2025-08-27', 1, '[]', 'DEBUG: 影像檢查報告摘要', 'khh00002', '2025-08-27 14:23:46', NULL, NULL);

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `config`
--
ALTER TABLE `config`
  ADD PRIMARY KEY (`INDEXNUMBER`);

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
  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `exclusion_criteria`
--
ALTER TABLE `exclusion_criteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '排除條件ID', AUTO_INCREMENT=9;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `inclusion_criteria`
--
ALTER TABLE `inclusion_criteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '納入條件ID', AUTO_INCREMENT=9;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '受試者ID', AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
