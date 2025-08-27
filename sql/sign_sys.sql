-- phpMyAdmin SQL Dump

-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- 主機： localhost:3306
-- 產生時間： 2025 年 07 月 09 日 03:34
-- 伺服器版本： 8.0.42-0ubuntu0.24.04.1
-- PHP 版本： 8.3.6


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--

-- 資料庫： `sign_sys`

--

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
(2, 'column_id_signlog', 'INDEXNUMBER,USER,DATE,SIGN_IN,SIGN_OUT,DURATION,LOG,STATE');

-- --------------------------------------------------------

--
-- 資料表結構 `signlog`
--

CREATE TABLE `signlog` (
  `INDEXNUMBER` int NOT NULL,
  `USER` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,

  `DATE` int NOT NULL,
  `SIGN_IN` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `SIGN_OUT` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `DURATION` time DEFAULT NULL,
  `LOG` text,
  `STATE` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `signlog`
--

INSERT INTO `signlog` (`INDEXNUMBER`, `USER`, `DATE`, `SIGN_IN`, `SIGN_OUT`, `DURATION`, `LOG`, `STATE`) VALUES
(20, 'khh00000', 20250518, '20250518-17:02:59', '20250518-17:03:10', '00:00:11', '簽到ip:127.0.0.1;簽退ip:127.0.0.1;', 'completed'),
(21, 'khh00000', 20250518, '20250518-17:41:00', '20250518-17:41:41', '00:00:41', '簽到ip:114.35.191.145;簽退ip:114.35.191.145;', 'completed'),
(22, 'khh00000', 20250518, '20250518-17:49:19', NULL, NULL, '簽到ip:114.35.191.145;20250519-01:50:52 異常操作;', 'abnormal'),
(23, 'khh00001', 20250518, '20250518-18:09:44', NULL, NULL, '簽到ip:114.35.191.145;', 'signin'),
(24, 'khh00000', 20250519, '20250519-01:50:52', '20250519-01:51:05', '00:00:13', '簽到ip:114.35.191.145;簽退ip:114.35.191.145;', 'completed'),
(25, 'khh00002', 20250519, '20250519-09:38:46', NULL, NULL, '簽到ip:111.70.33.5;20250521-10:32:37 異常操作;', 'abnormal'),
(26, 'khh00000', 20250519, '20250519-09:41:36', '20250519-09:41:57', '00:00:21', '簽到ip:111.70.33.5;簽退ip:111.70.33.5;', 'completed'),
(27, 'khh00002', 20250521, '20250521-10:32:37', '20250521-10:33:00', '00:00:23', '簽到ip:127.0.0.1;簽退ip:127.0.0.1;', 'completed'),
(31, 'khh00002', 20250523, '20250523-14:43:26', '20250523-14:43:47', '00:00:21', '簽到ip:127.0.0.1;簽退ip:127.0.0.1;', 'completed'),
(32, 'khh00002', 20250523, '20250523-14:43:54', '20250523-14:43:58', '00:00:04', '簽到ip:127.0.0.1;簽退ip:127.0.0.1;', 'completed'),
(35, '46b069d6-f992-4c17-aed9-ecb99e64cc27', 20250523, '20250523-15:44:15', '20250523-15:44:18', '00:00:03', '簽到ip:127.0.0.1;簽退ip:127.0.0.1;', 'completed'),
(36, '46b069d6-f992-4c17-aed9-ecb99e64cc27', 20250529, '20250529-11:13:02', '20250529-11:13:06', '00:00:04', '簽到ip:127.0.0.1;簽退ip:127.0.0.1;', 'completed'),
(37, 'khh00002', 20250609, '20250609-13:33:07', '20250609-13:33:10', '00:00:03', '簽到ip:127.0.0.1;簽退ip:127.0.0.1;', 'completed'),
(38, 'khh00002', 20250611, '20250611-09:14:55', NULL, NULL, '簽到ip:127.0.0.1;', 'signin');


--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `config`
--
ALTER TABLE `config`
  ADD PRIMARY KEY (`INDEXNUMBER`);

--
-- 資料表索引 `signlog`
--
ALTER TABLE `signlog`
  ADD PRIMARY KEY (`INDEXNUMBER`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `config`
--
ALTER TABLE `config`
  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `signlog`
--
ALTER TABLE `signlog`

  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
