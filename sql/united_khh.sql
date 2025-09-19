-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- 主機： localhost:3306
-- 產生時間： 2025 年 09 月 19 日 02:17
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
-- 資料庫： `united_khh`
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
(1, 'column_id_user', 'ID,USER,NAME,UNIQUE_ID,EMAIL,PASSWORD,DUEDATE,SESSION_KEY,LOGIN_LOG'),
(2, 'column_id_reset_password', 'INDEXNUMBER,USER,EMAIL,ACCESSCODE,VALIDTIME');

-- --------------------------------------------------------

--
-- 資料表結構 `reset_password`
--

CREATE TABLE `reset_password` (
  `INDEXNUMBER` int NOT NULL,
  `USER` varchar(20) NOT NULL,
  `EMAIL` varchar(100) NOT NULL,
  `ACCESSCODE` text NOT NULL,
  `VALIDTIME` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `reset_password`
--

INSERT INTO `reset_password` (`INDEXNUMBER`, `USER`, `EMAIL`, `ACCESSCODE`, `VALIDTIME`) VALUES
(27, 'pei', 'pswei@united-khh.com.tw', '174f3b5105a5759f2eaa5446572053004ccb09a02ffe08ca20f3f8286254dd9257bd1f96f731b41f26c6dc97cdb239ee8904477004ae4d2e14759d2c0f1cb33a', '250518174701'),
(31, 'testor', 'lc12310@gmail.com', '861d4a74d51d9c50093cebaaf8853660a340b6d48c211b0c6e179b86a72e5a3427f15de6b495bfd3ef052e94bf053142453000e2545e017f9593e03e04358043', '250518180705'),
(32, 'yenwen', 'yenwen@united-khh.com.tw', 'c1cf900347dba01ec2e94db78d71ca996d8d6b2869927c4c63ba4376a566a85bbfa6a393cf339767f8fdc7b2202df356b8bfa6e614279111e2f0326bf52489c4', '250519100731'),
(33, 'testor', 'yenwen@united-khh.com.tw', 'b5289d99db7ad3bbe773e1b5a4cd28137691d670512afb5cc82968d32571733f29be557a7e96fdf689eb3fc4630847ed919e1bf1ca5afa19d1d7659aba1b89c8', '250612101651');

-- --------------------------------------------------------

--
-- 資料表結構 `user`
--

CREATE TABLE `user` (
  `ID` int NOT NULL,
  `USER` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '帳號',
  `NAME` text NOT NULL,
  `UNIQUE_ID` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '員工編號',
  `INSTITUTION_CODE` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '試驗機構代碼',
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(256) NOT NULL,
  `DUEDATE` date NOT NULL,
  `SESSION_KEY` text NOT NULL,
  `LOGIN_LOG` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `user`
--

INSERT INTO `user` (`ID`, `USER`, `NAME`, `UNIQUE_ID`, `INSTITUTION_CODE`, `EMAIL`, `PASSWORD`, `DUEDATE`, `SESSION_KEY`, `LOGIN_LOG`) VALUES
(1, 'test03', '測試03', 'khh00001', '01', 'pswei@united-khh.com.tw', '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0', '2025-06-26', '34cc6d175afbf3eacdc2bbb7dcf864d5dbac55458fa7bdcb57028df3160b8aea,250919091921;789c0e72a52dd207521c10100fe1242890892b09c8389f3a53a5278ffb26dbd9,250919092120', '172.17.208.1,20250918 16:24:07,local login success;172.17.208.1,20250918 16:51:19,local login success;172.17.208.1,20250918 16:58:58,local login success;172.17.208.1,20250918 17:01:51,local login success;172.17.208.1,20250918 17:10:46,local login success;172.17.208.1,20250918 17:32:17,local login success;172.17.208.1,20250918 23:18:25,local login success;172.17.208.1,20250919 00:02:36,local login success;172.17.208.1,20250919 08:49:21,local login success;172.17.208.1,20250919 08:51:20,local login success'),
(2, 'test04', '測試04', 'khh00002', '02', 'yenwen@united-khh.com.tw', '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0', '2025-06-30', '018293706133f70d65843ed4df23237dbbaba73beb1aaaa95611db2eb064802c,250918180315', '172.17.208.1,20250918 16:31:17,local login success;172.17.208.1,20250918 16:32:37,local login success;172.17.208.1,20250918 16:34:37,local login success;172.17.208.1,20250918 16:37:22,local login success;172.17.208.1,20250918 16:39:13,local login success;172.17.208.1,20250918 16:49:20,local login success;172.17.208.1,20250918 16:51:52,local login success;172.17.208.1,20250918 17:00:15,local login success;172.17.208.1,20250918 17:11:21,local login success;172.17.208.1,20250918 17:33:15,local login success'),
(3, 'test02', '測試02', 'khh00000', '03', 'yenwen1@united-khh.com.tw', '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0', '2025-05-01', 'dffc4d00ba8546f13683deae6da4826112432c856bbc27a17858dfdee74bda83,250919102524', '172.17.208.1,20250918 17:45:24,local login success;172.17.208.1,20250918 18:04:59,local login success;172.17.208.1,20250918 18:15:14,local login success;172.17.208.1,20250918 23:16:13,local login success;172.17.208.1,20250918 23:59:18,local login success;172.17.208.1,20250919 00:20:48,local login success;172.17.208.1,20250919 08:46:17,local login success;172.17.208.1,20250919 09:00:45,local login success;172.17.208.1,20250919 09:13:04,local login success;172.17.208.1,20250919 09:55:24,local login success'),
(4, 'test01', '測試01', 'khh00003', '04', 'Pooiyt29@united-khh.com.tw', '9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0', '2025-09-10', '7d1f32804d34453199f0195a124f3b3b760bb382d632da69aa652849dc6d0619,250919091603', '127.0.0.1,20250912 13:43:27,local login success;127.0.0.1,20250912 13:55:38,local login success;127.0.0.1,20250912 15:21:09,local login success;127.0.0.1,20250916 16:16:04,local login success;127.0.0.1,20250918 11:41:59,local login success;127.0.0.1,20250918 11:48:05,local login success;172.17.208.1,20250918 17:31:05,local login success;172.17.208.1,20250918 22:53:44,local login success;172.17.208.1,20250918 23:15:09,local login success;172.17.208.1,20250919 08:46:03,local login success');

--
-- 已傾印資料表的索引
--

--
-- 資料表索引 `config`
--
ALTER TABLE `config`
  ADD PRIMARY KEY (`INDEXNUMBER`);

--
-- 資料表索引 `reset_password`
--
ALTER TABLE `reset_password`
  ADD PRIMARY KEY (`INDEXNUMBER`);

--
-- 資料表索引 `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`ID`),
  ADD UNIQUE KEY `USER` (`USER`),
  ADD UNIQUE KEY `UNIQUE_ID` (`UNIQUE_ID`);

--
-- 在傾印的資料表使用自動遞增(AUTO_INCREMENT)
--

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `config`
--
ALTER TABLE `config`
  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `reset_password`
--
ALTER TABLE `reset_password`
  MODIFY `INDEXNUMBER` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- 使用資料表自動遞增(AUTO_INCREMENT) `user`
--
ALTER TABLE `user`
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
