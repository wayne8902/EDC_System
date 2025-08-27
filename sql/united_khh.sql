-- phpMyAdmin SQL Dump

-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- 主機： localhost:3306
-- 產生時間： 2025 年 08 月 15 日 01:52
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
(1, 'pei', '魏培修', 'khh00001', 'pswei@united-khh.com.tw', '5c0c50176f3e7d77d1eaeecd586451d1706b433d4b1c2816928ac814d6e5319a', '2025-06-26', '6605de2b57862dc16d46c520ef79bd3c7fa54c43f26618bc7ca06d2671b2a4c6,250805184034;68734bd53c0495b22225dd66951b0501418b8c92f2f7eb64c569a1ea0c08d48a,250805184537;f6f2396965442746608af48cf7c4b812927deec33b254f930d0eb883442f8c38,250805184725;28ad1ec7c8ac8dcb3ddeed9de3308c5a833f55f1242b9c97beda0e115ae65225,250805185152;bd110c30575dc09f41042cdbacc2b4cad7b8e7f151d529c8cd628af9d1295282,250805185229', '127.0.0.1,20250805 17:57:47,local login success;127.0.0.1,20250805 18:01:24,local login success;127.0.0.1,20250805 18:06:27,local login success;127.0.0.1,20250805 18:07:59,local login success;127.0.0.1,20250805 18:09:10,local login success;127.0.0.1,20250805 18:10:34,local login success;127.0.0.1,20250805 18:15:37,local login success;127.0.0.1,20250805 18:17:25,local login success;127.0.0.1,20250805 18:21:52,local login success;127.0.0.1,20250805 18:22:29,local login success'),
(2, 'yenwen', '江衍彣', 'khh00002', 'yenwen@united-khh.com.tw', '4dce09d5e12e0ab49f0cbc1a4abecead05b68ab699af6a1c6f49851183f0aa25', '2025-06-30', '3b5fc62b724d3e8346cda84f57fd2c318f1a0ba0b8868f06045e33b554d00691,250815101948', '127.0.0.1,20250805 17:54:58,ms login success;127.0.0.1,20250805 17:56:55,ms login success;127.0.0.1,20250805 17:57:14,ms login success;127.0.0.1,20250805 18:01:07,ms login success;127.0.0.1,20250805 18:05:18,ms login success;127.0.0.1,20250805 18:06:22,ms login success;127.0.0.1,20250805 18:07:27,ms login success;127.0.0.1,20250805 18:21:21,ms login success;127.0.0.1,20250805 18:22:11,ms login success;127.0.0.1,20250815 09:49:48,ms login success'),
(3, 'testor', '測試帳號', 'khh00000', 'yenwen1@united-khh.com.tw', '45b7ec52f1e77d58dc27dfd79a46d21979531bca25d5f2578b3cd002f6975ab2', '2025-05-01', '21c0b3ab6c5b2950b5b4b956e641852edb155cc2c9052ca9aaa2ac5a786a8dba,250804182754;d15d146ce20110c932b0aa875b44e5657ea0fc2be3ae7d87c373f272d936d732,250804183758;199f5ac2fd477005dd86fa231c454c9da403342b716ef33cb4ce226effbdb85e,250804183929', '127.0.0.1,20250730 11:04:27,success;127.0.0.1,20250730 11:05:16,success;127.0.0.1,20250730 11:17:00,success;127.0.0.1,20250730 11:19:42,success;127.0.0.1,20250801 13:36:31,local login success;127.0.0.1,20250801 13:52:22,local login success;127.0.0.1,20250804 14:14:37,local login success;127.0.0.1,20250804 17:57:54,local login success;127.0.0.1,20250804 18:07:58,local login success;127.0.0.1,20250804 18:09:29,local login success');


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
