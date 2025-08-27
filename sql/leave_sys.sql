-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- 主機： localhost:3306
-- 產生時間： 2025 年 08 月 15 日 02:12
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
-- 資料庫： `leave_sys`
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
(1, 'column_id_leavelog', 'INDEXNUMBER,LEAVE_ID,USER,DATE,LEAVE_TYPE_ID,START_DATE,END_DATE,HOURS,DAYS,REASON,JOB_REP,APPROVALSTAGES,CURRENT_STAGE,APPROVALLOGS,FILEPATH,STATUS');

-- --------------------------------------------------------

--
-- 資料表結構 `LeaveBalance`
--

CREATE TABLE `LeaveBalance` (
  `ID` int NOT NULL,
  `USER` varchar(100) NOT NULL,
  `ANNUAL_LEAVE` float NOT NULL,
  `PERSONAL_LEAVE` float NOT NULL,
  `SICK_LEAVE` int NOT NULL,
  `COMPENSATORY` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `LeaveBalance`
--

INSERT INTO `LeaveBalance` (`ID`, `USER`, `ANNUAL_LEAVE`, `PERSONAL_LEAVE`, `SICK_LEAVE`, `COMPENSATORY`) VALUES
(1, 'khh00001', 7, 14, 30, 0),
(2, 'khh00002', 7, 11.5, 30, 0);

-- --------------------------------------------------------

--
-- 資料表結構 `LeaveRequests`
--

CREATE TABLE `LeaveRequests` (
  `INDEXNUMBER` int NOT NULL,
  `LEAVE_ID` varchar(20) NOT NULL,
  `USER` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `DATE` text NOT NULL,
  `LEAVE_TYPE_ID` int NOT NULL,
  `START_DATE` text NOT NULL,
  `END_DATE` text NOT NULL,
  `HOURS` int NOT NULL,
  `DAYS` float NOT NULL,
  `REASON` varchar(255) NOT NULL,
  `JOB_REP` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `APPROVALSTAGES` text NOT NULL,
  `CURRENT_STAGE` int NOT NULL DEFAULT '0',
  `APPROVALLOGS` text,
  `FILEPATH` text,
  `STATUS` enum('暫存','待職代審核','職代駁回','申請中','審核中','核准','退回','駁回') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '申請中'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `LeaveRequests`
--

INSERT INTO `LeaveRequests` (`INDEXNUMBER`, `LEAVE_ID`, `USER`, `DATE`, `LEAVE_TYPE_ID`, `START_DATE`, `END_DATE`, `HOURS`, `DAYS`, `REASON`, `JOB_REP`, `APPROVALSTAGES`, `CURRENT_STAGE`, `APPROVALLOGS`, `FILEPATH`, `STATUS`) VALUES
(128, '202508050001', 'khh00002', '20250805-17:57:37', 1, '2025-08-07 17:00', '2025-08-08 15:00', 6, 0.75, '123', 'khh00001', '[\"khh00002\", \"khh00001\", \"khh00001\"]', 3, '[[\"khh00002\", \"2025-08-05 17:57:40\", \"approve\"], [\"khh00001\", \"2025-08-05 17:57:51\", \"rep_reject\"], [\"khh00002\", \"2025-08-05 18:01:13\", \"approve\"], [\"khh00001\", \"2025-08-05 18:01:29\", \"rep_approve\"], [\"khh00001\", \"2025-08-05 18:05:05\", \"approve\"], [\"khh00001\", \"2025-08-05 18:05:11\", \"approve\"]]', '', '核准'),
(131, '202508050002', 'khh00002', '20250805-18:21:38', 1, '2025-08-06 16:00', '2025-08-07 15:00', 7, 0.875, '123', 'khh00001', '[\"khh00002\", \"khh00001\", \"khh00001\"]', 3, '[[\"khh00002\", \"2025-08-05 18:21:40\", \"approve\"], [\"khh00001\", \"2025-08-05 18:21:55\", \"rep_approve\"], [\"khh00001\", \"2025-08-05 18:22:01\", \"reject\", \"\"], [\"khh00002\", \"2025-08-05 18:22:20\", \"approve\"], [\"khh00001\", \"2025-08-05 18:22:32\", \"approve\"], [\"khh00001\", \"2025-08-05 18:22:37\", \"approve\"]]', '', '核准'),
(132, '202508150001', 'khh00002', '20250815-09:50:53', 2, '2025-08-16 10:00', '2025-08-17 09:00', 7, 0.875, '123', 'khh00001', '[\"khh00002\", \"khh00001\", \"khh00001\"]', 0, '[[\"khh00002\", \"2025-08-15 09:50:58\", \"approve\"]]', '', '待職代審核');

-- --------------------------------------------------------

--
-- 資料表結構 `LeaveTypes`
--

CREATE TABLE `LeaveTypes` (
  `LEAVE_TYPE_ID` int NOT NULL,
  `TYPE_NAME` enum('事假','病假','特休','公假','婚假','喪假','產假','陪產假','補休','其他','加班') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `LeaveTypes`
--

INSERT INTO `LeaveTypes` (`LEAVE_TYPE_ID`, `TYPE_NAME`) VALUES
(1, '事假'),
(2, '病假'),
(3, '特休'),
(4, '公假'),
(5, '婚假'),
(6, '喪假'),
(7, '產假'),
(8, '陪產假'),
(9, '補休'),
(10, '其他'),
(11, '加班');

-- --------------------------------------------------------

--
-- 資料表結構 `LeaveUsers`
--

CREATE TABLE `LeaveUsers` (
  `INDEXNUMBER` int NOT NULL,
  `USER` varchar(100) NOT NULL,
  `PATH` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `LeaveUsers`
--

INSERT INTO `LeaveUsers` (`INDEXNUMBER`, `USER`, `PATH`) VALUES
(1, 'khh00001', '/R&D/Manager'),
(2, 'khh00002', '/R&D/Manager/Supervisor'),
(3, 'khh00000', '/OPD/Manager'),
(4, 'khh00001', '/OPD');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `config`
--
ALTER TABLE `config`
  ADD PRIMARY KEY (`INDEXNUMBER`);

--
-- 資料表索引 `LeaveBalance`
--
ALTER TABLE `LeaveBalance`
  ADD PRIMARY KEY (`ID`);

--
-- 資料表索引 `LeaveRequests`
--
ALTER TABLE `LeaveRequests`
  ADD PRIMARY KEY (`INDEXNUMBER`),
  ADD KEY `LEAVE_TYPE_ID` (`LEAVE_TYPE_ID`);

--
-- 資料表索引 `LeaveTypes`
--
ALTER TABLE `LeaveTypes`
  ADD PRIMARY KEY (`LEAVE_TYPE_ID`);

--
-- 資料表索引 `LeaveUsers`
--
ALTER TABLE `LeaveUsers`
  ADD PRIMARY KEY (`INDEXNUMBER`),
  ADD KEY `USER` (`USER`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `config`
--
ALTER TABLE `config`
  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `LeaveBalance`
--
ALTER TABLE `LeaveBalance`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `LeaveRequests`
--
ALTER TABLE `LeaveRequests`
  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=133;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `LeaveTypes`
--
ALTER TABLE `LeaveTypes`
  MODIFY `LEAVE_TYPE_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `LeaveUsers`
--
ALTER TABLE `LeaveUsers`
  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- 已傾印資料表的限制式
--

--
-- 資料表的限制式 `LeaveRequests`
--
ALTER TABLE `LeaveRequests`
  ADD CONSTRAINT `LeaveRequests_ibfk_1` FOREIGN KEY (`LEAVE_TYPE_ID`) REFERENCES `LeaveTypes` (`LEAVE_TYPE_ID`) ON DELETE RESTRICT ON UPDATE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
