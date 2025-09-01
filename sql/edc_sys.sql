-- MySQL dump 10.13  Distrib 9.0.1, for macos14 (arm64)
--
-- Host: localhost    Database: edc_sys
-- ------------------------------------------------------
-- Server version	9.0.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `config` (
  `INDEXNUMBER` int NOT NULL AUTO_INCREMENT,
  `ID` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `VALUE` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`INDEXNUMBER`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config`
--

LOCK TABLES `config` WRITE;
/*!40000 ALTER TABLE `config` DISABLE KEYS */;
INSERT INTO `config` VALUES (1,'column_id_subjects','id,subject_code,date_of_birth,age,gender,height_cm,weight_kg,bmi,bac,dm,gout,imaging_type,imaging_date,kidney_stone_diagnosis,imaging_files,imaging_report_summary,created_by,created_at,updated_by,updated_at');
/*!40000 ALTER TABLE `config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `edit_log`
--

DROP TABLE IF EXISTS `edit_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `edit_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `log_id` varchar(7) DEFAULT NULL,
  `subject_code` varchar(20) NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `field_name` varchar(100) NOT NULL,
  `old_value` text,
  `new_value` text,
  `action` varchar(10) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_subject_code` (`subject_code`),
  KEY `idx_log_id` (`log_id`),
  KEY `idx_table_field` (`table_name`,`field_name`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `edit_log`
--

LOCK TABLES `edit_log` WRITE;
/*!40000 ALTER TABLE `edit_log` DISABLE KEYS */;
INSERT INTO `edit_log` VALUES (50,'8040333','P010002','subjects','date_of_birth','1990-01-01','1990-01-02','UPDATE','khh00002','2025-09-01 07:36:12'),(51,'8040333','P010002','subjects','age','35','36','UPDATE','khh00002','2025-09-01 07:36:12'),(52,'8040333','P010002','subjects','gender','1','0','UPDATE','khh00002','2025-09-01 07:36:12'),(53,'8040333','P010002','exclusion_criteria','pregnant_female','0','1','UPDATE','khh00002','2025-09-01 07:36:12');
/*!40000 ALTER TABLE `edit_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exclusion_criteria`
--

DROP TABLE IF EXISTS `exclusion_criteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exclusion_criteria` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '排除條件ID',
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
  `log` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted','signed') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間',
  `signed_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subject_exclusion` (`subject_code`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排除條件評估表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exclusion_criteria`
--

LOCK TABLES `exclusion_criteria` WRITE;
/*!40000 ALTER TABLE `exclusion_criteria` DISABLE KEYS */;
INSERT INTO `exclusion_criteria` VALUES (14,'P010002',1,0,0,NULL,0,NULL,0,NULL,0,0,NULL,0,NULL,0,'','8040333','draft','khh00002','2025-09-01 15:35:44','khh00002','2025-09-01 15:36:12',NULL,NULL);
/*!40000 ALTER TABLE `exclusion_criteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inclusion_criteria`
--

DROP TABLE IF EXISTS `inclusion_criteria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inclusion_criteria` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '納入條件ID',
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
  `log` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted','signed') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間',
  `signed_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subject_criteria` (`subject_code`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='納入條件評估表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inclusion_criteria`
--

LOCK TABLES `inclusion_criteria` WRITE;
/*!40000 ALTER TABLE `inclusion_criteria` DISABLE KEYS */;
INSERT INTO `inclusion_criteria` VALUES (15,'P010002',1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,'[]','[]','8040333','draft','khh00002','2025-09-01 15:35:44','khh00002','2025-09-01 15:36:12',NULL,NULL);
/*!40000 ALTER TABLE `inclusion_criteria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '受試者ID',
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
  `log` text COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted','signed') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間',
  `signed_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subject_code` (`subject_code`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='受試者資料表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (15,'P010002','1990-01-02',36,0,169.9,70,24.25,1,90,6.5,1.02,2,0,0,0,'CT','2025-09-01',1,'[]','','8040333','draft','khh00002','2025-09-01 15:35:44','khh00002','2025-09-01 15:36:12',NULL,NULL);
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-01 16:13:50
