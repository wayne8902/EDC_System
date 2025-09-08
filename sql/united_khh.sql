-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- 主機： localhost
-- 產生時間： 2025 年 09 月 08 日 10:24
-- 伺服器版本： 9.0.1
-- PHP 版本： 8.4.12

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
  `EMAIL` varchar(100) NOT NULL,
  `PASSWORD` varchar(256) NOT NULL,
  `DUEDATE` date NOT NULL,
  `SESSION_KEY` text NOT NULL,
  `LOGIN_LOG` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- 傾印資料表的資料 `user`
--

INSERT INTO `user` (`ID`, `USER`, `NAME`, `UNIQUE_ID`, `EMAIL`, `PASSWORD`, `DUEDATE`, `SESSION_KEY`, `LOGIN_LOG`) VALUES
(1, 'pei', '試驗主持人A', 'khh00001', '', '5c0c50176f3e7d77d1eaeecd586451d1706b433d4b1c2816928ac814d6e5319a', '2025-06-26', '10a456a8d874c13329c3c38528970b5c02a5996fbe105a014232d7dcf0315f6e,250908115554', '127.0.0.1,20250906 00:52:09,local login success;127.0.0.1,20250906 00:58:19,local login success;127.0.0.1,20250906 01:05:39,local login success;127.0.0.1,20250906 22:40:09,local login success;127.0.0.1,20250906 22:47:25,local login success;127.0.0.1,20250906 23:11:41,local login success;127.0.0.1,20250907 11:46:00,local login success;127.0.0.1,20250907 22:35:59,local login success;127.0.0.1,20250908 10:23:31,local login success;127.0.0.1,20250908 11:25:54,local login success'),
(2, 'yenwen', '試驗監測者A', 'khh00002', 'yenwen@united-khh.com.tw', '4dce09d5e12e0ab49f0cbc1a4abecead05b68ab699af6a1c6f49851183f0aa25', '2025-06-30', 'a7687c84d10863acefb6b2d0bced707bf46e6407a61d8764937ee3a16aed4dd6,250908182416;5eec7503684d64680142488225a7ba4e45281c9f532364b917b650ce261c8893,250908182603;1a73db9c5585a242fddc58a9ebd79d07108bd2b734f142328b81245224df9c44,250908183121;3e453316975fede5ac0d0564adb534166d8d021002ed91d26dac4d825e0b932d,250908183221;e7fde22b9aefa805502a510b0ec0ee3236fc658fd629eec00472c9411ac0c3f3,250908184233', '127.0.0.1,20250908 17:40:16,ms login success;127.0.0.1,20250908 17:45:34,ms login success;127.0.0.1,20250908 17:46:38,ms login success;127.0.0.1,20250908 17:47:56,ms login success;127.0.0.1,20250908 17:53:09,ms login success;127.0.0.1,20250908 17:54:16,ms login success;127.0.0.1,20250908 17:56:03,ms login success;127.0.0.1,20250908 18:01:21,ms login success;127.0.0.1,20250908 18:02:21,ms login success;127.0.0.1,20250908 18:12:33,ms login success'),
(3, 'testor', '研究人員A', 'khh00000', '', '45b7ec52f1e77d58dc27dfd79a46d21979531bca25d5f2578b3cd002f6975ab2', '2025-05-01', 'd57108c013971c3c5bcf12261a554548722d87aea698b5ee33d299d22494d4b9,250908181722;01873c59f5499e599d2c2bc87c54ba4eb837a6d4146d680e2a7670d54f71847d,250908182358;acabd367b5f91c51f59385f86f1d4487ee173ccf923e7d2484034b55de6a1ea1,250908183158;dbc5ef940a7fd0dbbdb921208ee8a2371920e375ffafd6f201c6f6a30a1e7107,250908183400;d194bc30e3e7fd29953fb07720c899c0819e0bb4565abacb19664ef683c79e2b,250908185145', '127.0.0.1,20250908 16:43:10,local login success;127.0.0.1,20250908 16:53:32,local login success;127.0.0.1,20250908 17:02:22,local login success;127.0.0.1,20250908 17:26:18,local login success;127.0.0.1,20250908 17:46:15,local login success;127.0.0.1,20250908 17:47:22,local login success;127.0.0.1,20250908 17:53:58,local login success;127.0.0.1,20250908 18:01:58,local login success;127.0.0.1,20250908 18:04:00,local login success;127.0.0.1,20250908 18:21:45,local login success');

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
  MODIFY `ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
