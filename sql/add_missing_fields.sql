-- 添加 subjects 表缺少的檢驗數值欄位
-- 執行日期：2025-01-27

USE edc_sys;

-- 添加檢驗數值欄位到 subjects 表
ALTER TABLE `subjects` 
ADD COLUMN `scr` float DEFAULT NULL COMMENT '血清肌酸酐 (mg/dL)' AFTER `bmi`,
ADD COLUMN `egfr` float DEFAULT NULL COMMENT '估算腎絲球過濾率 (mL/min/1.73m²)' AFTER `scr`,
ADD COLUMN `ph` float DEFAULT NULL COMMENT '尿液酸鹼值' AFTER `egfr`,
ADD COLUMN `sg` float DEFAULT NULL COMMENT '尿液比重' AFTER `ph`,
ADD COLUMN `rbc` int DEFAULT NULL COMMENT '尿液紅血球計數 (/HPF)' AFTER `sg`;

-- 更新 config 表中的欄位配置
UPDATE `config` 
SET `VALUE` = 'id,subject_code,date_of_birth,age,gender,height_cm,weight_kg,bmi,scr,egfr,ph,sg,rbc,bac,dm,gout,imaging_type,imaging_date,kidney_stone_diagnosis,imaging_files,imaging_report_summary,created_by,created_at,updated_by,updated_at'
WHERE `ID` = 'column_id_subjects';

-- 驗證欄位是否添加成功
DESCRIBE subjects;
