-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- 主機： localhost:3306
-- 產生時間： 2025 年 09 月 19 日 02:16
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
(1, 'column_id_subjects', 'id,enroll_date,subject_code,risk_score,date_of_birth,age,gender,measure_date,height_cm,weight_kg,bmi,biochem_date,scr,egfr,urine_date,ph,sg,urinalysis_date,rbc,bac,dm,dm_date,gout,gout_date,imaging_type,imaging_date,kidney_stone_diagnosis,imaging_files,imaging_report_summary,signature_hash,log,status,created_by,created_at,updated_by,updated_at,signed_by,signed_at'),
(2, 'column_id_inclusion_criteria', 'id,subject_code,age_18_above,gender_available,age_available,bmi_available,dm_history_available,gout_history_available,egfr_available,urine_ph_available,urine_sg_available,urine_rbc_available,bacteriuria_available,lab_interval_7days,imaging_available,kidney_structure_visible,mid_ureter_visible,lower_ureter_visible,imaging_lab_interval_7days,no_treatment_during_exam,medications,surgeries,signature_hash,log,status,created_by,created_at,updated_by,updated_at,signed_by,signed_at'),
(3, 'column_id_exclusion_criteria', 'id,subject_code,pregnant_female,kidney_transplant,urinary_tract_foreign_body,urinary_tract_foreign_body_type,non_stone_urological_disease,non_stone_urological_disease_type,renal_replacement_therapy,renal_replacement_therapy_type,medical_record_incomplete,major_blood_immune_cancer,major_blood_immune_cancer_type,rare_metabolic_disease,rare_metabolic_disease_type,investigator_judgment,judgment_reason,signature_hash,log,status,created_by,created_at,updated_by,updated_at,signed_by,signed_at'),
(4, 'column_id_queries', 'id,batch_id,subject_code,batch_data,query_count,status,created_by,created_at,assigned_to,assigned_at,completed_at,due_date,notes,updated_at'),
(5, 'column_id_query_responses', 'id,batch_id,field_name,table_name,original_question,response_text,response_type,original_value,corrected_value,status,responded_by,responded_at,attachments'),
(6, 'column_id_query_status_history', 'id,batch_id,old_status,new_status,changed_by,changed_at,reason'),
(7, 'column_id_edit_log', 'id,log_id,subject_code,table_name,field_name,old_value,new_value,action,user_id,created_at'),
(8, 'query_system_settings', '{\"auto_assign\":true,\"default_due_days\":7,\"notification_enabled\":true,\"escalation_hours\":48}');

-- --------------------------------------------------------

--
-- 資料表結構 `edit_log`
--

CREATE TABLE `edit_log` (
  `id` int NOT NULL,
  `log_id` varchar(7) DEFAULT NULL,
  `subject_code` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `table_name` varchar(50) NOT NULL,
  `field_name` varchar(100) NOT NULL,
  `old_value` text,
  `new_value` text,
  `action` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `edit_log`
--

INSERT INTO `edit_log` (`id`, `log_id`, `subject_code`, `table_name`, `field_name`, `old_value`, `new_value`, `action`, `user_id`, `created_at`) VALUES
(332, 'F37A008', 'P030013', 'system', 'action', 'draft', 'signed', 'SIGN', 'khh00001', '2025-09-17 08:31:59'),
(333, '5EDAFEB', 'P030013', 'system', 'operation', '', 'update_signature', 'UPDATE_SIGNATURE', 'khh00001', '2025-09-17 08:31:59'),
(334, 'C9AFFE6', 'P030012', 'system', 'action', 'draft', 'signed', 'SIGN', 'khh00001', '2025-09-17 08:51:05'),
(335, '99F95CC', 'P030012', 'system', 'operation', '', 'update_signature', 'UPDATE_SIGNATURE', 'khh00001', '2025-09-17 08:51:05'),
(336, 'E7CE434', 'P030012', 'system', 'status', 'signed', 'draft', 'UNSIGN', 'khh00001', '2025-09-17 08:53:06'),
(337, 'E7CE434', 'P030012', 'system', 'operation', 'update_signature', '', 'UNSIGN', 'khh00001', '2025-09-17 08:53:06'),
(338, 'E7CE434', 'P030012', 'system', 'signed_by', 'khh00001', '', 'UNSIGN', 'khh00001', '2025-09-17 08:53:06'),
(339, 'E7CE434', 'P030012', 'system', 'signed_at', '2025-09-17 16:51:05', '', 'UNSIGN', 'khh00001', '2025-09-17 08:53:06'),
(340, '778FFA3', 'P030012', 'system', 'action', 'draft', 'query', 'QUERY', 'khh00002', '2025-09-17 09:01:22'),
(341, 'D0C3DE1', 'P030019', 'system', 'action', 'draft', 'query', 'QUERY', 'khh00002', '2025-09-18 03:33:26'),
(387, 'DE6AB7A', 'P030022', 'subjects', 'date_of_birth', '', '1980-01-18', 'UPDATE', 'khh00000', '2025-09-18 07:08:53'),
(388, 'DE6AB7A', 'P030022', 'subjects', 'height_cm', '', '175', 'UPDATE', 'khh00000', '2025-09-18 07:08:53'),
(389, 'DE6AB7A', 'P030022', 'subjects', 'weight_kg', '', '79.1', 'UPDATE', 'khh00000', '2025-09-18 07:08:53'),
(390, 'DE6AB7A', 'P030022', 'subjects', 'biochem_date', '', '2025-09-18', 'UPDATE', 'khh00000', '2025-09-18 07:08:53'),
(391, 'DE6AB7A', 'P030022', 'subjects', 'urine_date', '', '2025-09-18', 'UPDATE', 'khh00000', '2025-09-18 07:08:53'),
(392, 'DE6AB7A', 'P030022', 'subjects', 'urinalysis_date', '', '2025-09-18', 'UPDATE', 'khh00000', '2025-09-18 07:08:53'),
(393, 'DE6AB7A', 'P030022', 'subjects', 'imaging_type', '', 'CT', 'UPDATE', 'khh00000', '2025-09-18 07:08:53'),
(394, 'DE6AB7A', 'P030022', 'subjects', 'imaging_date', '', '2025-09-18', 'UPDATE', 'khh00000', '2025-09-18 07:08:53'),
(395, 'DE6AB7A', 'P030022', 'subjects', 'kidney_stone_diagnosis', '', '0', 'UPDATE', 'khh00000', '2025-09-18 07:08:53'),
(396, 'DFB12D6', 'P030022', 'subjects', 'scr', '0', '', 'UPDATE', 'khh00000', '2025-09-18 07:18:27'),
(397, 'F17BC0D', 'P030024', 'subjects', 'height_cm', '175', '168.8', 'UPDATE', 'khh00000', '2025-09-18 07:34:00'),
(398, 'F17BC0D', 'P030024', 'subjects', 'bmi', '19.592', '21.1', 'UPDATE', 'khh00000', '2025-09-18 07:34:00'),
(399, 'F17BC0D', 'P030024', 'subjects', 'scr', '0.5', '', 'UPDATE', 'khh00000', '2025-09-18 07:34:00'),
(400, 'C9F735F', 'P030024', 'system', 'action', 'draft', 'query', 'QUERY', 'khh00002', '2025-09-18 08:00:59'),
(401, 'CD33E90', 'P030024', 'subjects', 'status', 'query', 'draft', 'QUERY_COMPLETED', 'khh00002', '2025-09-18 08:05:49'),
(402, 'A0FB869', 'P030023', 'system', 'action', 'draft', 'query', 'QUERY', 'khh00002', '2025-09-18 08:09:32'),
(403, 'A0F6235', 'P030024', 'system', 'action', 'draft', 'signed', 'SIGN', 'khh00001', '2025-09-18 08:24:23'),
(404, '6683833', 'P030024', 'system', 'operation', '', 'update_signature', 'UPDATE_SIGNATURE', 'khh00001', '2025-09-18 08:24:23'),
(405, '6047ADC', 'P030013', 'system', 'status', 'draft', 'submitted', 'SUBMIT', 'khh00000', '2025-09-18 08:51:04'),
(406, 'EBDBB1B', 'P030013', 'system', 'action', 'submitted', 'signed', 'SIGN', 'khh00001', '2025-09-18 08:51:40'),
(407, '872F967', 'P030013', 'system', 'operation', '', 'update_signature', 'UPDATE_SIGNATURE', 'khh00001', '2025-09-18 08:51:40'),
(408, 'D758E59', 'P030014', 'system', 'action', 'draft', 'signed', 'SIGN', 'khh00001', '2025-09-18 08:59:12'),
(409, '7A7E4AC', 'P030014', 'system', 'operation', '', 'update_signature', 'UPDATE_SIGNATURE', 'khh00001', '2025-09-18 08:59:12'),
(410, 'F029D11', 'P030014', 'system', 'operation', '', 'freeze', 'FREEZE', 'khh00002', '2025-09-18 09:00:26'),
(411, 'BFC2C31', 'P030010', 'system', 'status', 'draft', 'submitted', 'SUBMIT', 'khh00000', '2025-09-18 09:10:16'),
(412, 'D521DEB', 'P030010', 'system', 'action', 'submitted', 'signed', 'SIGN', 'khh00001', '2025-09-18 09:11:09'),
(413, '4CFD3B8', 'P030010', 'system', 'operation', '', 'update_signature', 'UPDATE_SIGNATURE', 'khh00001', '2025-09-18 09:11:09'),
(414, '37AF39C', 'P030010', 'system', 'operation', '', 'freeze', 'FREEZE', 'khh00002', '2025-09-18 09:12:14'),
(415, 'DAF97AE', 'P030009', 'system', 'status', 'draft', 'submitted', 'SUBMIT', 'khh00000', '2025-09-18 09:17:35'),
(416, '5584D16', 'P010001', 'subjects', 'date_of_birth', '', '1980-01-18', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(417, '5584D16', 'P010001', 'subjects', 'height_cm', '', '180', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(418, '5584D16', 'P010001', 'subjects', 'weight_kg', '', '60', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(419, '5584D16', 'P010001', 'subjects', 'bmi', '25.8', '18.5', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(420, '5584D16', 'P010001', 'subjects', 'biochem_date', '', '2025-09-19', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(421, '5584D16', 'P010001', 'subjects', 'urine_date', '', '2025-09-20', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(422, '5584D16', 'P010001', 'subjects', 'urinalysis_date', '', '2025-09-18', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(423, '5584D16', 'P010001', 'subjects', 'imaging_date', '', '2025-09-18', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(424, '5584D16', 'P010001', 'subjects', 'kidney_stone_diagnosis', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(425, '5584D16', 'P010001', 'inclusion_criteria', 'age_18_above', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(426, '5584D16', 'P010001', 'inclusion_criteria', 'gender_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(427, '5584D16', 'P010001', 'inclusion_criteria', 'age_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(428, '5584D16', 'P010001', 'inclusion_criteria', 'bmi_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(429, '5584D16', 'P010001', 'inclusion_criteria', 'dm_history_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(430, '5584D16', 'P010001', 'inclusion_criteria', 'gout_history_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(431, '5584D16', 'P010001', 'inclusion_criteria', 'egfr_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(432, '5584D16', 'P010001', 'inclusion_criteria', 'urine_ph_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(433, '5584D16', 'P010001', 'inclusion_criteria', 'urine_sg_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(434, '5584D16', 'P010001', 'inclusion_criteria', 'urine_rbc_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(435, '5584D16', 'P010001', 'inclusion_criteria', 'bacteriuria_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(436, '5584D16', 'P010001', 'inclusion_criteria', 'lab_interval_7days', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(437, '5584D16', 'P010001', 'inclusion_criteria', 'imaging_available', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(438, '5584D16', 'P010001', 'inclusion_criteria', 'kidney_structure_visible', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(439, '5584D16', 'P010001', 'inclusion_criteria', 'mid_ureter_visible', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(440, '5584D16', 'P010001', 'inclusion_criteria', 'lower_ureter_visible', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(441, '5584D16', 'P010001', 'inclusion_criteria', 'imaging_lab_interval_7days', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(442, '5584D16', 'P010001', 'inclusion_criteria', 'no_treatment_during_exam', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(443, '5584D16', 'P010001', 'exclusion_criteria', 'pregnant_female', '', '0', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(444, '5584D16', 'P010001', 'exclusion_criteria', 'kidney_transplant', '', '0', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(445, '5584D16', 'P010001', 'exclusion_criteria', 'urinary_tract_foreign_body', '', '0', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(446, '5584D16', 'P010001', 'exclusion_criteria', 'non_stone_urological_disease', '', '0', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(447, '5584D16', 'P010001', 'exclusion_criteria', 'renal_replacement_therapy', '', '0', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(448, '5584D16', 'P010001', 'exclusion_criteria', 'major_blood_immune_cancer', '', '0', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(449, '5584D16', 'P010001', 'exclusion_criteria', 'rare_metabolic_disease', '', '0', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(450, '5584D16', 'P010001', 'exclusion_criteria', 'investigator_judgment', '', '0', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(451, '5584D16', 'P010001', 'exclusion_criteria', 'medical_record_incomplete', '', '1', 'UPDATE', 'khh00001', '2025-09-18 16:27:59'),
(452, 'E9FEBA5', 'P030023', 'subjects', 'date_of_birth', '', '1987-12-29', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(453, 'E9FEBA5', 'P030023', 'subjects', 'age', '20', '37', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(454, 'E9FEBA5', 'P030023', 'subjects', 'height_cm', '', '175', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(455, 'E9FEBA5', 'P030023', 'subjects', 'weight_kg', '', '80', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(456, 'E9FEBA5', 'P030023', 'subjects', 'bmi', '25', '26.1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(457, 'E9FEBA5', 'P030023', 'subjects', 'biochem_date', '', '2025-09-18', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(458, 'E9FEBA5', 'P030023', 'subjects', 'urine_date', '', '2025-09-19', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(459, 'E9FEBA5', 'P030023', 'subjects', 'urinalysis_date', '', '2025-09-18', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(460, 'E9FEBA5', 'P030023', 'subjects', 'imaging_date', '', '2025-09-18', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(461, 'E9FEBA5', 'P030023', 'subjects', 'kidney_stone_diagnosis', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(462, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'age_18_above', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(463, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'gender_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(464, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'age_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(465, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'bmi_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(466, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'dm_history_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(467, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'gout_history_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(468, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'egfr_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(469, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'urine_ph_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(470, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'urine_sg_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(471, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'urine_rbc_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(472, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'bacteriuria_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(473, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'lab_interval_7days', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(474, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'imaging_available', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(475, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'kidney_structure_visible', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(476, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'mid_ureter_visible', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(477, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'lower_ureter_visible', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(478, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'imaging_lab_interval_7days', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(479, 'E9FEBA5', 'P030023', 'inclusion_criteria', 'no_treatment_during_exam', '', '1', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(480, 'E9FEBA5', 'P030023', 'exclusion_criteria', 'pregnant_female', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(481, 'E9FEBA5', 'P030023', 'exclusion_criteria', 'kidney_transplant', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(482, 'E9FEBA5', 'P030023', 'exclusion_criteria', 'urinary_tract_foreign_body', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(483, 'E9FEBA5', 'P030023', 'exclusion_criteria', 'non_stone_urological_disease', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(484, 'E9FEBA5', 'P030023', 'exclusion_criteria', 'renal_replacement_therapy', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(485, 'E9FEBA5', 'P030023', 'exclusion_criteria', 'major_blood_immune_cancer', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(486, 'E9FEBA5', 'P030023', 'exclusion_criteria', 'rare_metabolic_disease', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(487, 'E9FEBA5', 'P030023', 'exclusion_criteria', 'investigator_judgment', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(488, 'E9FEBA5', 'P030023', 'exclusion_criteria', 'medical_record_incomplete', '', '0', 'UPDATE', 'khh00000', '2025-09-19 02:03:50'),
(489, '28664AD', 'P030022', 'exclusion_criteria', 'medical_record_incomplete', '1', '0', 'UPDATE', 'khh00000', '2025-09-19 02:13:15');

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
  `signature_hash` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted','signed','frozen') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間',
  `signed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排除條件評估表';

--
-- 傾印資料表的資料 `exclusion_criteria`
--

INSERT INTO `exclusion_criteria` (`id`, `subject_code`, `pregnant_female`, `kidney_transplant`, `urinary_tract_foreign_body`, `urinary_tract_foreign_body_type`, `non_stone_urological_disease`, `non_stone_urological_disease_type`, `renal_replacement_therapy`, `renal_replacement_therapy_type`, `medical_record_incomplete`, `major_blood_immune_cancer`, `major_blood_immune_cancer_type`, `rare_metabolic_disease`, `rare_metabolic_disease_type`, `investigator_judgment`, `judgment_reason`, `signature_hash`, `log`, `status`, `created_by`, `created_at`, `updated_by`, `updated_at`, `signed_by`, `signed_at`) VALUES
(1, 'P030001', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, 'draft', 'khh00000', '2024-01-15 09:30:00', NULL, NULL, NULL, NULL),
(2, 'P030002', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, 'draft', 'khh00000', '2024-01-16 10:15:00', NULL, NULL, NULL, NULL),
(3, 'P030003', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, 'draft', 'khh00000', '2024-01-17 11:45:00', NULL, NULL, NULL, NULL),
(4, 'P030004', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, 'draft', 'khh00000', '2024-01-18 08:20:00', NULL, NULL, NULL, NULL),
(5, 'P030005', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, 'draft', 'khh00000', '2024-01-19 13:30:00', NULL, NULL, NULL, NULL),
(6, 'P030006', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, 'draft', 'khh00000', '2024-01-20 09:15:00', NULL, NULL, NULL, NULL),
(7, 'P030007', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, 'draft', 'khh00000', '2024-01-21 10:30:00', NULL, NULL, NULL, NULL),
(8, 'P030008', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, NULL, NULL, 'draft', 'khh00000', '2024-01-22 11:45:00', NULL, NULL, NULL, NULL),
(9, 'P030009', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, NULL, 'DAF97AE', 'submitted', 'khh00000', '2024-01-23 08:50:00', NULL, NULL, NULL, NULL),
(10, 'P030010', 0, 0, 0, NULL, 0, NULL, 0, NULL, 0, 0, NULL, 0, NULL, 0, NULL, '3b2fd6ce4d9e1142956cec6842d647a1a832f05a24375d6b38f0870a7a8b829f', 'BFC2C31;D521DEB;4CFD3B8', 'signed', 'khh00000', '2024-01-24 12:15:00', 'khh00001', NULL, 'khh00001', '2025-09-18 17:11:09'),
(78, 'P030011', 0, 0, 0, '', 0, '', 0, '', 0, 0, '', 0, '', 0, '', '0', NULL, 'draft', 'khh00000', '2025-09-17 11:02:09', NULL, NULL, NULL, NULL),
(79, 'P030012', 0, 0, 0, '', 0, '', 0, '', 0, 0, '', 0, '', 0, '', NULL, 'C9AFFE6;99F95CC;E7CE434', 'draft', 'khh00000', '2025-09-17 13:55:05', 'khh00001', '2025-09-17 16:53:06', NULL, '2025-09-17 16:53:06'),
(80, 'P030013', 0, 0, 0, '', 0, '', 0, '', 0, 0, '', 0, '', 0, '', '96893f5dc4528ea27c5a6c1f890d37e0b6d7a5a1ec6563793639cc17ade61558', 'F37A008;5EDAFEB;C372ABA;6047ADC;EBDBB1B;872F967', 'signed', 'khh00000', '2025-09-17 14:00:08', 'khh00001', '2025-09-17 16:40:49', 'khh00001', '2025-09-18 16:51:40'),
(81, 'P030014', 0, 0, 0, '', 0, '', 0, '', 0, 0, '', 0, '', 0, '', '25bb372480a4cbb989a6675e7ffdc58876759cdb90364545bcf62dfe5853d870', 'D758E59;7A7E4AC', 'signed', 'khh00000', '2025-09-17 20:06:55', 'khh00001', NULL, 'khh00001', '2025-09-18 16:59:12'),
(87, 'P030018', NULL, NULL, NULL, '', NULL, '', NULL, '', NULL, NULL, '', NULL, '', NULL, '', NULL, NULL, NULL, 'khh00000', '2025-09-18 11:21:35', NULL, NULL, NULL, NULL),
(88, 'P030019', 0, 0, 0, '', 0, '', 0, '', 0, 0, '', 0, '', 0, '', '0', NULL, 'draft', 'khh00000', '2025-09-18 11:21:56', NULL, NULL, NULL, NULL),
(89, 'P030020', NULL, NULL, NULL, '', NULL, '', NULL, '', NULL, NULL, '', NULL, '', NULL, '', NULL, NULL, NULL, 'khh00000', '2025-09-18 14:14:50', NULL, NULL, NULL, NULL),
(90, 'P030021', NULL, NULL, NULL, '', NULL, '', NULL, '', NULL, NULL, '', NULL, '', NULL, '', NULL, NULL, NULL, 'khh00000', '2025-09-18 14:17:33', NULL, NULL, NULL, NULL),
(91, 'P030022', 0, 0, 0, '0', 0, '0', 0, '0', 0, 0, '0', 0, '0', 0, NULL, '0', 'DE6AB7A;DFB12D6;28664AD', NULL, 'khh00000', '2025-09-18 14:22:51', 'khh00000', '2025-09-19 10:13:15', NULL, NULL),
(92, 'P030023', 0, 0, 0, '0', 0, '0', 0, '0', 0, 0, '0', 0, '0', 0, NULL, '0', 'E9FEBA5', NULL, 'khh00000', '2025-09-18 14:35:02', 'khh00000', '2025-09-19 10:03:50', NULL, NULL),
(93, 'P030024', 0, 0, 0, '0', 0, '0', 0, '0', 0, 0, '0', 0, '0', 0, NULL, '546cd1a473b1f6f616945b152f79abdaff020361d6b9eb46596930f7a70e978d', 'F17BC0D;A0F6235;6683833', 'signed', 'khh00000', '2025-09-18 15:33:30', 'khh00001', '2025-09-18 15:34:00', 'khh00001', '2025-09-18 16:24:23'),
(94, 'P010001', 0, 0, 0, '0', 0, '0', 0, '0', 1, 0, '0', 0, '0', 0, NULL, '0', '5584D16', NULL, 'khh00001', '2025-09-19 00:22:42', 'khh00001', '2025-09-19 00:27:59', NULL, NULL),
(95, 'P010002', 0, 0, 0, '', 0, '', 0, '', 0, 0, '', 0, '', 0, '', '0', NULL, 'draft', 'khh00001', '2025-09-19 08:54:23', NULL, NULL, NULL, NULL),
(96, 'P030025', 0, 0, 0, '', 0, '', 0, '', 1, 0, '', 0, '', 0, '', '0', NULL, 'draft', 'khh00000', '2025-09-19 09:56:29', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- 資料表結構 `inclusion_criteria`
--

CREATE TABLE `inclusion_criteria` (
  `id` int NOT NULL COMMENT '納入條件ID',
  `subject_code` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '受試者編號',
  `age_18_above` int DEFAULT NULL COMMENT '患者年齡是否18歲(含)以上?(0=否,1=是)',
  `gender_available` int DEFAULT NULL COMMENT '病歷中是否記載性別?(0=否,1=是)',
  `age_available` int DEFAULT NULL COMMENT '病歷中是否記載年齡?(0=否,1=是)',
  `bmi_available` int DEFAULT NULL COMMENT '病歷中是否記載BMI?(0=否,1=是)',
  `dm_history_available` int DEFAULT NULL COMMENT '病歷中是否記載糖尿病病史?(0=否,1=是)',
  `gout_history_available` int DEFAULT NULL COMMENT '病歷中是否記載痛風病史?(0=否,1=是)',
  `egfr_available` int DEFAULT NULL COMMENT '病歷中是否具備eGFR檢驗資料?(0=否,1=是)',
  `urine_ph_available` int DEFAULT NULL COMMENT '病歷中是否具備尿液pH檢驗資料?(0=否,1=是)',
  `urine_sg_available` int DEFAULT NULL COMMENT '病歷中是否具備尿液SG檢驗資料?(0=否,1=是)',
  `urine_rbc_available` int DEFAULT NULL COMMENT '病歷中是否具備尿液RBC counts檢驗資料?(0=否,1=是)',
  `bacteriuria_available` int DEFAULT NULL COMMENT '病歷中是否具備菌尿症檢驗資料?(0=否,1=是)',
  `lab_interval_7days` int DEFAULT NULL COMMENT '各檢驗項目採檢時間間隔是否皆未超過7天?(0=否,1=是)',
  `imaging_available` int DEFAULT NULL COMMENT '病歷中是否記錄腹部CT或PET-CT影像資料?(0=否,1=是)',
  `kidney_structure_visible` int DEFAULT NULL COMMENT '影像資料是否可完整顯現腎臟結構?(0=否,1=是)',
  `mid_ureter_visible` int DEFAULT NULL COMMENT '影像資料是否可完整顯現中段輸尿管結構?(0=否,1=是)',
  `lower_ureter_visible` int DEFAULT NULL COMMENT '影像資料是否可完整顯現下段輸尿管結構?(0=否,1=是)',
  `imaging_lab_interval_7days` int DEFAULT NULL COMMENT '影像檢查與檢驗資料時間間隔是否皆未超過7天?(0=否,1=是)',
  `no_treatment_during_exam` int DEFAULT NULL COMMENT '檢查期間是否無任何治療處置紀錄?(0=否,1=是)',
  `medications` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '藥物治療記錄(JSON格式)',
  `surgeries` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '手術治療記錄(JSON格式)',
  `signature_hash` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','submitted','signed','frozen') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間',
  `signed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='納入條件評估表';

--
-- 傾印資料表的資料 `inclusion_criteria`
--

INSERT INTO `inclusion_criteria` (`id`, `subject_code`, `age_18_above`, `gender_available`, `age_available`, `bmi_available`, `dm_history_available`, `gout_history_available`, `egfr_available`, `urine_ph_available`, `urine_sg_available`, `urine_rbc_available`, `bacteriuria_available`, `lab_interval_7days`, `imaging_available`, `kidney_structure_visible`, `mid_ureter_visible`, `lower_ureter_visible`, `imaging_lab_interval_7days`, `no_treatment_during_exam`, `medications`, `surgeries`, `signature_hash`, `log`, `status`, `created_by`, `created_at`, `updated_by`, `updated_at`, `signed_by`, `signed_at`) VALUES
(1, 'P030001', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', NULL, NULL, 'draft', 'khh00000', '2024-01-15 09:30:00', NULL, NULL, NULL, NULL),
(2, 'P030002', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[{\"name\":\"Metformin\",\"dose\":\"500mg\",\"frequency\":\"BID\"}]', '[]', NULL, NULL, 'draft', 'khh00000', '2024-01-16 10:15:00', NULL, NULL, NULL, NULL),
(3, 'P030003', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', NULL, NULL, 'draft', 'khh00000', '2024-01-17 11:45:00', NULL, NULL, NULL, NULL),
(4, 'P030004', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[{\"name\":\"Insulin\",\"dose\":\"10 units\",\"frequency\":\"TID\"}]', '[]', NULL, NULL, 'draft', 'khh00000', '2024-01-18 08:20:00', NULL, NULL, NULL, NULL),
(5, 'P030005', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[{\"name\":\"Allopurinol\",\"dose\":\"300mg\",\"frequency\":\"QD\"}]', '[]', NULL, NULL, 'draft', 'khh00000', '2024-01-19 13:30:00', NULL, NULL, NULL, NULL),
(6, 'P030006', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[{\"name\":\"Metformin\",\"dose\":\"850mg\",\"frequency\":\"BID\"}]', '[]', NULL, NULL, 'draft', 'khh00000', '2024-01-20 09:15:00', NULL, NULL, NULL, NULL),
(7, 'P030007', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', NULL, NULL, 'draft', 'khh00000', '2024-01-21 10:30:00', NULL, NULL, NULL, NULL),
(8, 'P030008', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[{\"name\":\"Insulin\",\"dose\":\"15 units\",\"frequency\":\"BID\"},{\"name\":\"Allopurinol\",\"dose\":\"200mg\",\"frequency\":\"QD\"}]', '[]', NULL, NULL, 'draft', 'khh00000', '2024-01-22 11:45:00', NULL, NULL, NULL, NULL),
(9, 'P030009', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', NULL, 'DAF97AE', 'submitted', 'khh00000', '2024-01-23 08:50:00', NULL, NULL, NULL, NULL),
(10, 'P030010', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[{\"name\":\"Metformin\",\"dose\":\"1000mg\",\"frequency\":\"BID\"}]', '[]', '3b2fd6ce4d9e1142956cec6842d647a1a832f05a24375d6b38f0870a7a8b829f', 'BFC2C31;D521DEB;4CFD3B8', 'signed', 'khh00000', '2024-01-24 12:15:00', 'khh00001', NULL, 'khh00001', '2025-09-18 17:11:09'),
(79, 'P030011', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', '0', NULL, 'draft', 'khh00000', '2025-09-17 11:02:09', NULL, NULL, NULL, NULL),
(80, 'P030012', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', NULL, 'C9AFFE6;99F95CC;E7CE434', 'draft', 'khh00000', '2025-09-17 13:55:05', 'khh00001', '2025-09-17 16:53:06', NULL, '2025-09-17 16:53:06'),
(81, 'P030013', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', '96893f5dc4528ea27c5a6c1f890d37e0b6d7a5a1ec6563793639cc17ade61558', 'F37A008;5EDAFEB;C372ABA;6047ADC;EBDBB1B;872F967', 'signed', 'khh00000', '2025-09-17 14:00:08', 'khh00001', '2025-09-17 16:40:49', 'khh00001', '2025-09-18 16:51:40'),
(82, 'P030014', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', '25bb372480a4cbb989a6675e7ffdc58876759cdb90364545bcf62dfe5853d870', 'D758E59;7A7E4AC', 'signed', 'khh00000', '2025-09-17 20:06:55', 'khh00001', NULL, 'khh00001', '2025-09-18 16:59:12'),
(88, 'P030018', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL, 'khh00000', '2025-09-18 11:21:35', NULL, NULL, NULL, NULL),
(89, 'P030019', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', '0', NULL, 'draft', 'khh00000', '2025-09-18 11:21:56', NULL, NULL, NULL, NULL),
(90, 'P030020', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL, 'khh00000', '2025-09-18 14:14:50', NULL, NULL, NULL, NULL),
(91, 'P030021', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '[]', '[]', NULL, NULL, NULL, 'khh00000', '2025-09-18 14:17:33', NULL, NULL, NULL, NULL),
(92, 'P030022', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', '0', 'DE6AB7A;DFB12D6;28664AD', NULL, 'khh00000', '2025-09-18 14:22:51', 'khh00000', '2025-09-19 10:13:15', NULL, NULL),
(93, 'P030023', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', '0', 'E9FEBA5', NULL, 'khh00000', '2025-09-18 14:35:02', 'khh00000', '2025-09-19 10:03:50', NULL, NULL),
(94, 'P030024', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', '546cd1a473b1f6f616945b152f79abdaff020361d6b9eb46596930f7a70e978d', 'F17BC0D;A0F6235;6683833', 'signed', 'khh00000', '2025-09-18 15:33:30', 'khh00001', '2025-09-18 15:34:00', 'khh00001', '2025-09-18 16:24:23'),
(95, 'P010001', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', '0', '5584D16', NULL, 'khh00001', '2025-09-19 00:22:42', 'khh00001', '2025-09-19 00:27:59', NULL, NULL),
(96, 'P010002', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, '[{\"date\": \"2025-09-19\", \"name\": \"123\"}]', '[{\"date\": \"2025-09-19\", \"name\": \"123\"}]', '0', NULL, 'draft', 'khh00001', '2025-09-19 08:54:23', NULL, NULL, NULL, NULL),
(97, 'P030025', 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, '[]', '[]', '0', NULL, 'draft', 'khh00000', '2025-09-19 09:56:29', NULL, NULL, NULL, NULL);

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
  `status` enum('pending','accept','reject','correct','explain','completed') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT '整體狀態',
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
(25, 'B202509171459560250b354', 'P030013', '{\"queries\": [{\"question\": \"測試\", \"field_name\": \"height_cm\", \"query_type\": \"clarification\", \"table_name\": \"subjects\", \"current_value\": \"170.1\", \"expected_value\": \"180\"}], \"subject_code\": \"P030013\"}', 1, 'completed', 'khh00002', '2025-09-17 06:59:56', NULL, NULL, '2025-09-17 07:12:10', NULL, NULL, '2025-09-17 07:12:10'),
(26, 'B20250917170122e47d1778', 'P030012', '{\"queries\": [{\"question\": \"測試\", \"field_name\": \"age\", \"query_type\": \"correction\", \"table_name\": \"subjects\", \"current_value\": \"35\", \"expected_value\": \"40\"}], \"subject_code\": \"P030012\"}', 1, 'pending', 'khh00002', '2025-09-17 09:01:22', NULL, NULL, NULL, NULL, NULL, '2025-09-17 09:01:22'),
(27, 'B20250918113326abcd6591', 'P030019', '{\"queries\": [{\"question\": \"測試\", \"field_name\": \"gender\", \"query_type\": \"verification\", \"table_name\": \"subjects\", \"current_value\": \"1\", \"expected_value\": \"0\"}, {\"question\": \"測試\", \"field_name\": \"bmi\", \"query_type\": \"clarification\", \"table_name\": \"subjects\", \"current_value\": \"24.2\", \"expected_value\": \"25\"}], \"subject_code\": \"P030019\"}', 2, 'reject', 'khh00002', '2025-09-18 03:33:26', NULL, NULL, '2025-09-18 08:08:37', NULL, NULL, '2025-09-18 08:08:37'),
(28, 'B2025091816005906974265', 'P030024', '{\"queries\": [{\"question\": \"測試\", \"field_name\": \"age\", \"query_type\": \"clarification\", \"table_name\": \"subjects\", \"current_value\": \"35\", \"expected_value\": \"36\"}, {\"question\": \"測試\", \"field_name\": \"weight_kg\", \"query_type\": \"correction\", \"table_name\": \"subjects\", \"current_value\": \"60\", \"expected_value\": \"59\"}], \"subject_code\": \"P030024\"}', 2, 'completed', 'khh00002', '2025-09-18 08:00:59', NULL, NULL, '2025-09-18 08:05:49', NULL, NULL, '2025-09-18 08:05:49'),
(29, 'B20250918160932e8736d18', 'P030023', '{\"queries\": [{\"question\": \"測試\", \"field_name\": \"age\", \"query_type\": \"clarification\", \"table_name\": \"subjects\", \"current_value\": \"20\", \"expected_value\": \"20\"}], \"subject_code\": \"P030023\"}', 1, 'pending', 'khh00002', '2025-09-18 08:09:32', NULL, NULL, NULL, NULL, NULL, '2025-09-18 08:09:32');

--
-- 觸發器 `queries`
--
DELIMITER $$
CREATE TRIGGER `queries_status_change_log` AFTER UPDATE ON `queries` FOR EACH ROW BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO `query_status_history` 
        (`batch_id`, `old_status`, `new_status`, `changed_by`, `reason`)
        VALUES 
        (NEW.batch_id, OLD.status, NEW.status, NEW.created_by, 'Status updated')$$
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

--
-- 傾印資料表的資料 `query_responses`
--

INSERT INTO `query_responses` (`id`, `batch_id`, `field_name`, `table_name`, `original_question`, `response_text`, `response_type`, `original_value`, `corrected_value`, `status`, `responded_by`, `responded_at`, `attachments`) VALUES
(19, 'B202509171459560250b354', 'height_cm', 'subjects', '測試', '數值沒問題', 'escalation', '', '', 'responded', 'khh00000', '2025-09-17 07:11:26', NULL),
(20, 'B2025091816005906974265', 'age', 'subjects', '測試', '測試', 'escalation', '', '', 'responded', 'khh00000', '2025-09-18 08:05:19', NULL),
(21, 'B2025091816005906974265', 'weight_kg', 'subjects', '測試', '測試', 'escalation', '', '', 'responded', 'khh00000', '2025-09-18 08:05:19', NULL),
(22, 'B20250918113326abcd6591', 'gender', 'subjects', '測試', '123', 'escalation', '', '', 'responded', 'khh00000', '2025-09-18 08:08:37', NULL),
(23, 'B20250918113326abcd6591', 'bmi', 'subjects', '測試', '123', 'escalation', '', '', 'responded', 'khh00000', '2025-09-18 08:08:37', NULL);

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

--
-- 傾印資料表的資料 `query_status_history`
--

INSERT INTO `query_status_history` (`id`, `batch_id`, `old_status`, `new_status`, `changed_by`, `changed_at`, `reason`) VALUES
(17, 'B202509171459560250b354', 'pending', 'reject', 'khh00002', '2025-09-17 07:11:26', 'Status updated'),
(18, 'B202509171459560250b354', 'reject', 'completed', 'khh00002', '2025-09-17 07:12:10', 'Status updated'),
(19, 'B2025091816005906974265', 'pending', 'reject', 'khh00002', '2025-09-18 08:05:19', 'Status updated'),
(20, 'B2025091816005906974265', 'reject', 'completed', 'khh00002', '2025-09-18 08:05:49', 'Status updated'),
(21, 'B20250918113326abcd6591', 'pending', 'reject', 'khh00002', '2025-09-18 08:08:37', 'Status updated');

-- --------------------------------------------------------

--
-- 資料表結構 `subjects`
--

CREATE TABLE `subjects` (
  `id` int NOT NULL COMMENT '受試者ID',
  `enroll_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '個案納入日期',
  `subject_code` varchar(7) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '受試者編號',
  `risk_score` int NOT NULL,
  `date_of_birth` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '出生日期',
  `age` int DEFAULT NULL COMMENT '年齡(計算欄位)',
  `gender` int NOT NULL COMMENT '性別(0=女,1=男)',
  `measure_date` text COLLATE utf8mb4_unicode_ci,
  `height_cm` float DEFAULT NULL COMMENT '身高(cm)',
  `weight_kg` float DEFAULT NULL COMMENT '體重(kg)',
  `bmi` float DEFAULT NULL COMMENT 'BMI(計算欄位)',
  `biochem_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '生化檢驗採檢日期',
  `scr` float DEFAULT NULL,
  `egfr` float DEFAULT NULL,
  `urine_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '尿液檢驗採檢日期',
  `ph` float DEFAULT NULL,
  `sg` float DEFAULT NULL,
  `urinalysis_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '尿液鏡檢採檢日期',
  `rbc` float DEFAULT NULL,
  `bac` int DEFAULT NULL COMMENT '菌尿症(0=無,1=有)',
  `dm` int DEFAULT NULL COMMENT '糖尿病(0=無,1=有)',
  `dm_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '糖尿病診斷日期',
  `gout` int DEFAULT NULL COMMENT '痛風(0=無,1=有)',
  `gout_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '痛風診斷日期',
  `imaging_type` enum('CT','PET-CT','') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '影像檢查類型',
  `imaging_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '影像檢查日期',
  `kidney_stone_diagnosis` int DEFAULT NULL COMMENT '腎結石診斷結果',
  `imaging_files` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '影像報告上傳檔案路徑(JSON格式)',
  `imaging_report_summary` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '影像伴讀報告摘要',
  `signature_hash` varchar(256) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` enum('draft','query','submitted','signed','frozen') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `created_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立者',
  `created_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '建立時間',
  `updated_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `updated_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '更新時間',
  `signed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `frozen_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frozen_at` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='受試者資料表';

--
-- 傾印資料表的資料 `subjects`
--

INSERT INTO `subjects` (`id`, `enroll_date`, `subject_code`, `risk_score`, `date_of_birth`, `age`, `gender`, `measure_date`, `height_cm`, `weight_kg`, `bmi`, `biochem_date`, `scr`, `egfr`, `urine_date`, `ph`, `sg`, `urinalysis_date`, `rbc`, `bac`, `dm`, `dm_date`, `gout`, `gout_date`, `imaging_type`, `imaging_date`, `kidney_stone_diagnosis`, `imaging_files`, `imaging_report_summary`, `signature_hash`, `log`, `status`, `created_by`, `created_at`, `updated_by`, `updated_at`, `signed_by`, `signed_at`, `frozen_by`, `frozen_at`) VALUES
(1, '2024-01-15', 'P030001', 0, '1985-03-15', 39, 1, NULL, 175.5, 70.2, 22.8, '2024-01-10', 0.9, 85.2, '2024-01-10', 6.5, 1.015, '2024-01-10', 2.1, 0, 0, NULL, 0, NULL, 'CT', '2024-01-12', 1, '[\"file1.pdf\", \"file2.pdf\"]', '左腎結石3mm，右腎正常', NULL, NULL, 'draft', 'khh00000', '2024-01-15 09:30:00', NULL, NULL, NULL, NULL, '', ''),
(2, '2024-01-16', 'P030002', 0, '1978-07-22', 45, 0, NULL, 162.3, 58.7, 22.3, '2024-01-11', 1.1, 78.5, '2024-01-11', 6.8, 1.02, '2024-01-11', 1.8, 0, 1, '2020-05-15', 1, '2019-08-20', 'PET-CT', '2024-01-13', 0, '[\"file3.pdf\"]', '雙側腎臟正常，無結石發現', NULL, NULL, 'draft', 'khh00000', '2024-01-16 10:15:00', NULL, NULL, NULL, NULL, '', ''),
(3, '2024-01-17', 'P030003', 0, '1992-11-08', 31, 1, NULL, 180.2, 75.8, 23.3, '2024-01-12', 0.8, 92.1, '2024-01-12', 6.2, 1.01, '2024-01-12', 3.2, 1, 0, NULL, 0, NULL, 'CT', '2024-01-14', 1, '[\"file4.pdf\", \"file5.pdf\"]', '右腎結石5mm，左腎正常', NULL, NULL, 'draft', 'khh00000', '2024-01-17 11:45:00', NULL, NULL, NULL, NULL, '', ''),
(4, '2024-01-18', 'P030004', 0, '1965-04-30', 58, 0, NULL, 158.7, 65.4, 26, '2024-01-13', 1.3, 65.8, '2024-01-13', 7.1, 1.025, '2024-01-13', 2.5, 0, 1, '2018-12-10', 0, NULL, 'CT', '2024-01-15', 1, '[\"file6.pdf\"]', '左腎結石8mm，右腎小結石2mm', NULL, NULL, 'draft', 'khh00000', '2024-01-18 08:20:00', NULL, NULL, NULL, NULL, '', ''),
(5, '2024-01-19', 'P030005', 0, '1988-09-14', 35, 1, NULL, 172.8, 68.9, 23.1, '2024-01-14', 0.95, 88.3, '2024-01-14', 6.3, 1.012, '2024-01-14', 1.9, 0, 0, NULL, 1, '2021-03-25', 'PET-CT', '2024-01-16', 0, '[\"file7.pdf\"]', '雙側腎臟正常，無異常發現', NULL, NULL, 'draft', 'khh00000', '2024-01-19 13:30:00', NULL, NULL, NULL, NULL, '', ''),
(6, '2024-01-20', 'P030006', 0, '1973-12-05', 50, 0, NULL, 165.1, 72.3, 26.5, '2024-01-15', 1.2, 72.1, '2024-01-15', 6.9, 1.018, '2024-01-15', 2.8, 1, 1, '2019-07-08', 0, NULL, 'CT', '2024-01-17', 1, '[\"file8.pdf\", \"file9.pdf\"]', '右腎結石6mm，左腎正常', NULL, NULL, 'draft', 'khh00000', '2024-01-20 09:15:00', NULL, NULL, NULL, NULL, '', ''),
(7, '2024-01-21', 'P030007', 0, '1995-06-18', 28, 1, NULL, 178.6, 82.1, 25.7, '2024-01-16', 0.85, 95.6, '2024-01-16', 6, 1.008, '2024-01-16', 1.5, 0, 0, NULL, 0, NULL, 'CT', '2024-01-18', 1, '[\"file10.pdf\"]', '左腎結石4mm，右腎正常', NULL, NULL, 'draft', 'khh00000', '2024-01-21 10:30:00', NULL, NULL, NULL, NULL, '', ''),
(8, '2024-01-22', 'P030008', 0, '1968-01-25', 56, 0, NULL, 160.4, 69.8, 27.1, '2024-01-17', 1.4, 62.3, '2024-01-17', 7.3, 1.03, '2024-01-17', 3.5, 1, 1, '2017-11-20', 1, '2020-09-12', 'PET-CT', '2024-01-19', 0, '[\"file11.pdf\"]', '雙側腎臟正常，無結石發現', NULL, NULL, 'draft', 'khh00000', '2024-01-22 11:45:00', NULL, NULL, NULL, NULL, '', ''),
(9, '2024-01-23', 'P030009', 0, '1982-08-12', 41, 1, NULL, 174.3, 71.5, 23.5, '2024-01-18', 1, 82.7, '2024-01-18', 6.4, 1.014, '2024-01-18', 2.2, 0, 0, NULL, 0, NULL, 'CT', '2024-01-20', 1, '[\"file12.pdf\", \"file13.pdf\"]', '右腎結石7mm，左腎小結石3mm', NULL, 'DAF97AE', 'submitted', 'khh00000', '2024-01-23 08:50:00', 'khh00000', NULL, NULL, NULL, '', ''),
(10, '2024-01-24', 'P030010', 0, '1976-05-03', 47, 0, NULL, 163.9, 66.2, 24.6, '2024-01-19', 1.15, 75.9, '2024-01-19', 6.7, 1.016, '2024-01-19', 2.6, 0, 1, '2021-02-14', 0, NULL, 'CT', '2024-01-21', 1, '[\"file14.pdf\"]', '左腎結石5mm，右腎正常', '3b2fd6ce4d9e1142956cec6842d647a1a832f05a24375d6b38f0870a7a8b829f', 'BFC2C31;D521DEB;4CFD3B8;37AF39C', 'frozen', 'khh00000', '2024-01-24 12:15:00', 'khh00001', NULL, 'khh00001', '2025-09-18 17:11:09', 'khh00002', '2025-09-18 17:12:14'),
(81, '2025-09-17', 'P030011', 1, '1990-01-01', 35, 1, NULL, 169.9, 70, 24.25, '2025-09-17', 1, 63.1, '2025-09-17', 6.5, 1.02, '2025-09-17', 2, 0, 0, '', 0, '', 'CT', '2025-09-17', 1, '[]', 'DEBUG: 影像檢查報告摘要', '', NULL, 'draft', 'khh00000', '2025-09-17 11:02:09', NULL, NULL, NULL, NULL, '', ''),
(82, '2025-09-17', 'P030012', 0, '1990-01-01', 35, 1, NULL, 170.1, 70, 24.193, '2025-09-17', 1, 63.1, '2025-09-17', 6.5, 1.02, '2025-09-17', 2, 0, 0, '', 0, '', 'CT', '2025-09-17', 1, '[]', 'DEBUG: 影像檢查報告摘要', NULL, 'C9AFFE6;99F95CC;E7CE434;778FFA3', 'query', 'khh00000', '2025-09-17 13:55:05', 'khh00002', '2025-09-17 16:53:06', NULL, '2025-09-17 16:53:06', '', ''),
(83, '2025-09-17', 'P030013', 1, '1990-01-01', 35, 1, NULL, 170.1, 70, 24.193, '2025-09-17', 1, 63.1, '2025-09-17', 6.5, 1.02, '2025-09-17', 10, 0, 0, '', 0, '', 'CT', '2025-09-17', 1, '[]', 'DEBUG: 影像檢查報告摘要', '96893f5dc4528ea27c5a6c1f890d37e0b6d7a5a1ec6563793639cc17ade61558', 'F37A008;5EDAFEB;C372ABA;6047ADC;EBDBB1B;872F967;21B1BF7', 'frozen', 'khh00000', '2025-09-17 14:00:08', 'khh00001', '2025-09-17 16:40:49', 'khh00001', '2025-09-18 16:51:40', 'khh00002', '2025-09-18 16:52:03'),
(84, '2025-09-17', 'P030014', 1, '1990-01-01', 35, 1, NULL, 170.1, 70, 24.193, '2025-09-17', 1, 63.1, '2025-09-17', 6.5, 1.02, '2025-09-17', 2, 0, 0, '', 0, '', 'CT', '2025-09-17', 1, '[]', 'DEBUG: 影像檢查報告摘要', '25bb372480a4cbb989a6675e7ffdc58876759cdb90364545bcf62dfe5853d870', 'D758E59;7A7E4AC;F029D11', 'frozen', 'khh00000', '2025-09-17 20:06:55', 'khh00001', NULL, 'khh00001', '2025-09-18 16:59:12', 'khh00002', '2025-09-18 17:00:26'),
(91, '2025-09-18', 'P030018', 0, '1990-01-01', 65, 1, NULL, NULL, NULL, 25, '2025-09-18', NULL, 101.87, '2025-09-18', 5, 1, '2025-09-18', 0, 0, 0, '', 0, '', 'CT', '2025-09-18', NULL, '[]', 'iStone 計算結果', NULL, NULL, NULL, 'khh00000', '2025-09-18 11:21:35', NULL, NULL, NULL, NULL, '', ''),
(92, '2025-09-18', 'P030019', 1, NULL, 35, 1, NULL, 170.1, 70, 24.193, '2025-09-18', 1, 63.1, '2025-09-18', 6.5, 1.02, '2025-09-18', 2, 0, 0, '', 0, '', 'CT', '2025-09-18', 1, '[]', 'DEBUG: 影像檢查報告摘要', NULL, 'D0C3DE1', 'query', 'khh00000', '2025-09-18 11:21:56', 'khh00002', NULL, NULL, NULL, '', ''),
(93, '2025-09-18', 'P030020', 1, '1990-01-01', 65, 1, NULL, NULL, NULL, 25.8, '2025-09-18', NULL, 109.1, '2025-09-18', 6.5, 1.019, '2025-09-18', 0, 0, 0, '', 0, '', 'CT', '2025-09-18', NULL, '[]', 'iStone 計算結果', NULL, NULL, NULL, 'khh00000', '2025-09-18 14:14:50', NULL, NULL, NULL, NULL, '', ''),
(94, '2025-09-18', 'P030021', 1, '1990-01-01', 65, 1, NULL, NULL, NULL, 25.8, '2025-09-18', NULL, 109.1, '2025-09-18', 6.5, 1.019, '2025-09-18', 0, 0, 0, '', 0, '', 'CT', '2025-09-18', NULL, '[]', 'iStone 計算結果', NULL, NULL, NULL, 'khh00000', '2025-09-18 14:17:33', NULL, NULL, NULL, NULL, '', ''),
(95, '2025-09-18', 'P030022', 0, '1980-01-18', 45, 1, NULL, 175, 79.1, 25.8, '2025-09-18', NULL, 109.1, '2025-09-18', 6.5, 1.019, '2025-09-18', 0, 0, 0, NULL, 0, NULL, 'CT', '2025-09-18', 0, '[]', NULL, NULL, 'DE6AB7A;DFB12D6;28664AD', NULL, 'khh00000', '2025-09-18 14:22:51', 'khh00000', '2025-09-19 10:13:15', NULL, NULL, '', ''),
(96, '2025-09-18', 'P030023', 0, '1987-12-29', 37, 1, NULL, 175, 80, 26.1, '2025-09-18', NULL, 90, '2025-09-19', 5, 1, '2025-09-18', 0, 0, 0, NULL, 0, NULL, 'CT', '2025-09-18', 0, '[]', NULL, NULL, 'A0FB869;E9FEBA5', 'query', 'khh00000', '2025-09-18 14:35:02', 'khh00000', '2025-09-19 10:03:50', NULL, NULL, '', ''),
(97, '2025-09-17', 'P030024', 1, '1990-01-01', 35, 1, NULL, 168.8, 60, 21.1, '2025-09-18', NULL, 140.4, '2025-09-18', 5, 1.1, '2025-09-18', 0, 0, 0, NULL, 0, NULL, 'CT', '2025-09-18', 0, '[]', NULL, '546cd1a473b1f6f616945b152f79abdaff020361d6b9eb46596930f7a70e978d', 'F17BC0D;C9F735F;A0F6235;6683833;BE420E4', 'frozen', 'khh00000', '2025-09-18 15:33:30', 'khh00001', '2025-09-18 16:05:49', 'khh00001', '2025-09-18 16:24:23', 'khh00002', '2025-09-18 16:39:22'),
(98, '2025-09-19', 'P010001', 1, '1980-01-18', 45, 1, NULL, 180, 60, 18.5, '2025-09-19', NULL, 109.1, '2025-09-20', 5.5, 1.028, '2025-09-18', 1, 0, 0, NULL, 0, NULL, 'CT', '2025-09-18', 1, '[]', NULL, NULL, '5584D16', NULL, 'khh00001', '2025-09-19 00:22:42', 'khh00001', '2025-09-19 00:27:59', NULL, NULL, NULL, NULL),
(99, '2025-09-19', 'P010002', 1, '1990-01-02', 35, 1, NULL, 175, 80, 26.122, '2025-09-18', 0.5, 140.4, '2025-09-19', 5, 1.1, '2025-09-19', 0, 0, 0, '', 0, '', 'CT', '2025-09-19', 0, '[]', '', NULL, NULL, 'draft', 'khh00001', '2025-09-19 08:54:23', NULL, NULL, NULL, NULL, NULL, NULL),
(100, '2025-09-18', 'P030025', 1, '1990-01-02', 35, 1, '2025-09-19', 175, 80, 26.122, '2025-09-18', 0.5, 140.4, '2025-09-18', 5, 1, '2025-09-19', 0, 0, 0, '', 0, '', 'CT', '2025-09-19', 0, '[]', '', NULL, NULL, 'draft', 'khh00000', '2025-09-19 09:56:29', NULL, NULL, NULL, NULL, NULL, NULL);

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
  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `edit_log`
--
ALTER TABLE `edit_log`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=490;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `exclusion_criteria`
--
ALTER TABLE `exclusion_criteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '排除條件ID', AUTO_INCREMENT=97;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `inclusion_criteria`
--
ALTER TABLE `inclusion_criteria`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '納入條件ID', AUTO_INCREMENT=98;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `queries`
--
ALTER TABLE `queries`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT 'Query ID (主鍵)', AUTO_INCREMENT=30;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `query_responses`
--
ALTER TABLE `query_responses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '回應ID', AUTO_INCREMENT=24;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `query_status_history`
--
ALTER TABLE `query_status_history`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '歷史記錄ID', AUTO_INCREMENT=22;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '受試者ID', AUTO_INCREMENT=101;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `edit_log`
--
ALTER TABLE `edit_log`
  ADD CONSTRAINT `edit_log_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `exclusion_criteria`
--
ALTER TABLE `exclusion_criteria`
  ADD CONSTRAINT `exclusion_criteria_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `inclusion_criteria`
--
ALTER TABLE `inclusion_criteria`
  ADD CONSTRAINT `inclusion_criteria_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- 資料表的限制式 `queries`
--
ALTER TABLE `queries`
  ADD CONSTRAINT `queries_ibfk_1` FOREIGN KEY (`subject_code`) REFERENCES `subjects` (`subject_code`) ON DELETE CASCADE ON UPDATE CASCADE;

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
