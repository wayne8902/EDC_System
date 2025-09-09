-- 添加糖尿病和痛風診斷日期欄位到 subjects 表
-- 執行日期: 2025-01-27

-- 添加糖尿病診斷日期欄位
ALTER TABLE `subjects` 
ADD COLUMN `dm_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '糖尿病診斷日期' 
AFTER `dm`;

-- 添加痛風診斷日期欄位
ALTER TABLE `subjects` 
ADD COLUMN `gout_date` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '痛風診斷日期' 
AFTER `gout`;

-- 更新 config 表中的 column_id_subjects 欄位
UPDATE `config` 
SET `VALUE` = 'id,enroll_date,subject_code,date_of_birth,age,gender,height_cm,weight_kg,bmi,biochem_date,scr,egfr,urine_date,ph,sg,urinalysis_date,rbc,bac,dm,dm_date,gout,gout_date,imaging_type,imaging_date,kidney_stone_diagnosis,imaging_files,imaging_report_summary,signature_hash,log,status,created_by,created_at,updated_by,updated_at,signed_by,signed_at'
WHERE `ID` = 'column_id_subjects';

-- 驗證欄位是否添加成功
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'edc_sys' 
  AND TABLE_NAME = 'subjects' 
  AND COLUMN_NAME IN ('dm_date', 'gout_date');
