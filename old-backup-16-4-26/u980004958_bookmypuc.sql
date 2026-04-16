-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 16, 2026 at 05:54 PM
-- Server version: 11.8.6-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u980004958_bookmypuc`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`u980004958_bookmypuc`@`127.0.0.1` PROCEDURE `GetAdminDashboardStats` ()   BEGIN
  SELECT 
    (SELECT COUNT(*) FROM bookings) AS total_bookings,
    (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
    (SELECT COUNT(*) FROM centers WHERE status = 'active') AS active_centers,
    (SELECT SUM(price) FROM bookings WHERE status = 'done') AS total_revenue;
END$$

CREATE DEFINER=`u980004958_bookmypuc`@`127.0.0.1` PROCEDURE `GetShopOwnerBookingStats` (IN `p_owner_id` INT)   BEGIN
  SELECT 
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN b.status = 'pending' THEN 1 ELSE 0 END) AS pending_bookings,
    SUM(CASE WHEN b.status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed_bookings,
    SUM(CASE WHEN b.status = 'done' THEN 1 ELSE 0 END) AS completed_bookings,
    SUM(CASE WHEN b.status = 'done' THEN b.price ELSE 0 END) AS total_revenue
  FROM bookings b
  JOIN centers c ON b.center_id = c.id
  WHERE c.owner_id = p_owner_id;
END$$

CREATE DEFINER=`u980004958_bookmypuc`@`127.0.0.1` PROCEDURE `GetUserBookingStats` (IN `p_user_id` INT)   BEGIN
  SELECT 
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN status = 'confirmed' AND date >= CURDATE() THEN 1 ELSE 0 END) AS upcoming_bookings,
    SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS completed_bookings,
    SUM(CASE WHEN status = 'done' THEN price ELSE 0 END) AS total_spent
  FROM bookings
  WHERE user_id = p_user_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'admin',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `name`, `email`, `password`, `role`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin@bookmypuc.com', '$2a$12$JeL6kR89.asl3B7u0nEI7u6Ie0CSvrwNEtIjrTQolfE17CJef0g7i', 'admin', '2026-04-02 10:45:33', '2026-04-02 10:45:33');

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `center_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time` varchar(10) NOT NULL,
  `status` enum('pending','confirmed','done','cancelled') DEFAULT 'pending',
  `price` decimal(10,2) NOT NULL,
  `puc_number` varchar(50) DEFAULT NULL,
  `certificate` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `center_id`, `vehicle_id`, `date`, `time`, `status`, `price`, `puc_number`, `certificate`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2026-04-18', '11:30', 'pending', 200.00, NULL, NULL, '2026-04-16 17:42:21', '2026-04-16 17:42:21');

-- --------------------------------------------------------

--
-- Stand-in structure for view `booking_details`
-- (See below for the actual view)
--
CREATE TABLE `booking_details` (
`id` int(11)
,`user_id` int(11)
,`user_name` varchar(100)
,`user_email` varchar(100)
,`user_phone` varchar(20)
,`center_id` int(11)
,`center_name` varchar(200)
,`center_address` text
,`city` varchar(100)
,`state` varchar(100)
,`owner_id` int(11)
,`shop_owner_name` varchar(100)
,`vehicle_id` int(11)
,`vehicle_number` varchar(20)
,`vehicle_type` enum('2W','3W','4W','Commercial')
,`vehicle_brand` varchar(50)
,`vehicle_model` varchar(50)
,`vehicle_fuel` enum('Petrol','Diesel')
,`date` date
,`time` varchar(10)
,`status` enum('pending','confirmed','done','cancelled')
,`price` decimal(10,2)
,`puc_number` varchar(50)
,`certificate` varchar(255)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Table structure for table `centers`
--

CREATE TABLE `centers` (
  `id` int(11) NOT NULL,
  `owner_id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) NOT NULL,
  `state` varchar(100) NOT NULL,
  `taluka` varchar(100) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `working_hours` varchar(50) NOT NULL,
  `contact` varchar(20) NOT NULL,
  `pricing_2w_petrol` decimal(10,2) DEFAULT 50.00,
  `pricing_3w_petrol` decimal(10,2) DEFAULT 100.00,
  `pricing_3w_diesel` decimal(10,2) DEFAULT 150.00,
  `pricing_4w_petrol` decimal(10,2) DEFAULT 125.00,
  `pricing_4w_diesel` decimal(10,2) DEFAULT 150.00,
  `pricing_commercial_diesel` decimal(10,2) DEFAULT 150.00,
  `pricing_commercial_petrol` decimal(10,2) DEFAULT 150.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `centers`
--

INSERT INTO `centers` (`id`, `owner_id`, `name`, `address`, `city`, `state`, `taluka`, `pincode`, `working_hours`, `contact`, `pricing_2w_petrol`, `pricing_3w_petrol`, `pricing_3w_diesel`, `pricing_4w_petrol`, `pricing_4w_diesel`, `pricing_commercial_diesel`, `pricing_commercial_petrol`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, 'ArunPUC', 'Naupada , Thane West', 'Thane', 'Maharashtra', 'Thane', '400602', '09:00 - 18:00', '9326261416', 50.00, 100.00, 150.00, 125.00, 150.00, 250.00, 200.00, 'active', '2026-04-16 17:24:20', '2026-04-16 17:24:20');

-- --------------------------------------------------------

--
-- Table structure for table `contact_submissions`
--

CREATE TABLE `contact_submissions` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `status` enum('new','read','replied') DEFAULT 'new',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contact_submissions`
--

INSERT INTO `contact_submissions` (`id`, `name`, `email`, `mobile`, `subject`, `message`, `status`, `created_at`, `updated_at`) VALUES
(1, 'User1', 'user1@mail.com', '9999990001', 'Help', 'Need help', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(2, 'User2', 'user2@mail.com', '9999990002', 'Issue', 'Facing issue', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(3, 'User3', 'user3@mail.com', '9999990003', 'Support', 'Support needed', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(4, 'User4', 'user4@mail.com', '9999990004', 'Booking', 'Booking issue', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(5, 'User5', 'user5@mail.com', '9999990005', 'Payment', 'Payment query', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(6, 'User6', 'user6@mail.com', '9999990006', 'General', 'General question', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(7, 'User7', 'user7@mail.com', '9999990007', 'Feedback', 'Great service', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(8, 'User8', 'user8@mail.com', '9999990008', 'Complaint', 'Complaint', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(9, 'User9', 'user9@mail.com', '9999990009', 'Query', 'Query', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(10, 'User10', 'user10@mail.com', '9999990010', 'Other', 'Other message', 'new', '2026-04-01 18:09:47', '2026-04-01 18:09:47'),
(11, 'Arun Mishra', '90secondsvisuals@gmail.com', '9326261416', 'test message ', 'test message here', 'new', '2026-04-02 06:28:35', '2026-04-02 06:28:35');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `user_role` enum('user','shopOwner','admin') NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `booking_id` int(11) DEFAULT NULL,
  `center_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `user_role`, `type`, `title`, `message`, `is_read`, `booking_id`, `center_id`, `created_at`) VALUES
(1, 1, 'user', 'booking', 'Booking Confirmed', 'Your booking is confirmed', 0, NULL, NULL, '2026-04-01 18:09:47'),
(2, 2, 'user', 'booking', 'Booking Pending', 'Your booking is pending', 0, NULL, NULL, '2026-04-01 18:09:47'),
(3, 3, 'user', 'booking', 'Booking Done', 'Your booking is completed', 0, NULL, NULL, '2026-04-01 18:09:47'),
(4, 4, 'shopOwner', 'alert', 'New Booking', 'New booking received', 0, NULL, NULL, '2026-04-01 18:09:47'),
(5, 5, 'shopOwner', 'alert', 'Reminder', 'Check pending bookings', 0, NULL, NULL, '2026-04-01 18:09:47'),
(6, 6, 'admin', 'system', 'Report', 'Daily report generated', 0, NULL, NULL, '2026-04-01 18:09:47'),
(7, 7, 'user', 'booking', 'Cancelled', 'Booking cancelled', 0, NULL, NULL, '2026-04-01 18:09:47'),
(8, 8, 'user', 'booking', 'Reminder', 'Upcoming booking', 0, NULL, NULL, '2026-04-01 18:09:47'),
(9, 9, 'shopOwner', 'alert', 'Payment', 'Payment received', 0, NULL, NULL, '2026-04-01 18:09:47'),
(10, 10, 'admin', 'system', 'Alert', 'System update', 0, NULL, NULL, '2026-04-01 18:09:47'),
(11, 1, 'admin', 'user_registered', 'New User Registered', 'Arun Mishra has registered on the platform', 0, NULL, NULL, '2026-04-01 18:40:59'),
(12, 1, 'admin', 'user_registered', 'New User Registered', 'Arun Mishra has registered on the platform', 0, NULL, NULL, '2026-04-02 06:41:14'),
(13, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Arun Mishra has booked an appointment at PUC Center 1', 0, 11, NULL, '2026-04-02 06:51:12'),
(14, 12, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-04 at 03:30', 1, 11, NULL, '2026-04-02 07:22:44'),
(15, 1, 'admin', 'user_registered', 'New User Registered', 'Varun Mishra has registered on the platform', 0, NULL, NULL, '2026-04-02 07:52:33'),
(16, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Varun Mishra has booked an appointment at PUC Center 1', 0, 12, NULL, '2026-04-02 07:52:33'),
(17, 13, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-04 at 00:00', 0, 12, NULL, '2026-04-02 08:14:42'),
(18, 13, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (PUC12MH5665163) from PUC Center 1 is ready', 0, 12, NULL, '2026-04-02 08:15:07'),
(19, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Varun Mishra has booked an appointment at PUC Center 1', 0, 13, NULL, '2026-04-02 08:39:24'),
(20, 13, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-04 at 04:30', 0, 13, NULL, '2026-04-02 08:39:54'),
(21, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Arun Mishra has booked an appointment at PUC Center 1', 0, 14, NULL, '2026-04-02 09:09:08'),
(22, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Arun Mishra has booked an appointment at PUC Center 1', 0, 15, NULL, '2026-04-02 09:13:54'),
(23, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Arun Mishra has booked an appointment at PUC Center 1', 0, 16, NULL, '2026-04-02 09:16:42'),
(24, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Arun Mishra has booked an appointment at PUC Center 1', 0, 17, NULL, '2026-04-02 09:18:43'),
(25, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Arun Mishra has booked an appointment at PUC Center 1', 0, 18, NULL, '2026-04-02 09:25:32'),
(26, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Arun Mishra has booked an appointment at PUC Center 1', 0, 19, NULL, '2026-04-02 09:29:10'),
(27, 12, 'user', 'booking_rejected', 'Booking Rejected', 'Your booking at PUC Center 1 has been rejected. Please try another center.', 0, 14, NULL, '2026-04-02 09:30:25'),
(28, 12, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-04 at 05:00', 0, 19, NULL, '2026-04-02 09:42:29'),
(29, 12, 'user', 'booking_rejected', 'Booking Rejected ❌', 'Your booking at PUC Center 1 has been rejected. Please try another center.', 0, 18, NULL, '2026-04-02 09:42:59'),
(30, 12, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (1234567890) from PUC Center 1 is ready', 0, 19, NULL, '2026-04-02 10:15:45'),
(31, 12, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (1234567890) from PUC Center 1 is ready', 0, 19, NULL, '2026-04-02 10:16:31'),
(32, 13, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (1234567890) from PUC Center 1 is ready', 0, 13, NULL, '2026-04-02 10:20:41'),
(33, 12, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (1234567890) from PUC Center 1 is ready', 0, 11, NULL, '2026-04-02 10:24:30'),
(34, 1, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (1234567890) from PUC Center 1 is ready', 0, 1, NULL, '2026-04-02 10:27:03'),
(35, 12, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-04 at -1:00', 0, 17, NULL, '2026-04-02 10:28:46'),
(36, 12, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (1234567890) from PUC Center 1 is ready', 0, 17, NULL, '2026-04-02 10:28:55'),
(37, 1, 'admin', 'user_registered', 'New User Registered', 'Arun Mishra has registered on the platform', 0, NULL, NULL, '2026-04-02 10:50:49'),
(38, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Arun Mishra has booked an appointment at PUC Center 1', 0, 20, NULL, '2026-04-02 10:50:49'),
(39, 14, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-04 at 04:30', 1, 20, NULL, '2026-04-02 10:51:42'),
(40, 14, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (1234567890) from PUC Center 1 is ready', 1, 20, NULL, '2026-04-02 10:53:34'),
(41, 1, 'admin', 'user_registered', 'New User Registered', 'OMKAR DIPAK MUTTE has registered on the platform', 0, NULL, NULL, '2026-04-02 11:22:35'),
(42, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'OMKAR DIPAK MUTTE has booked an appointment at PUC Center 1', 0, 21, NULL, '2026-04-02 11:22:36'),
(43, 15, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-04 at 05:00', 0, 21, NULL, '2026-04-02 11:26:14'),
(44, 15, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (1234567891) from PUC Center 1 is ready', 0, 21, NULL, '2026-04-02 11:27:26'),
(45, 1, 'admin', 'user_registered', 'New User Registered', 'dk puc has registered on the platform', 0, NULL, NULL, '2026-04-02 12:17:47'),
(46, 1, 'admin', 'user_registered', 'New User Registered', 'aman has registered on the platform', 0, NULL, NULL, '2026-04-02 12:21:38'),
(47, 1, 'admin', 'user_registered', 'New User Registered', 'shubham has registered on the platform', 0, NULL, NULL, '2026-04-02 12:56:51'),
(48, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'shubham has booked an appointment at PUC Center 1', 0, 22, NULL, '2026-04-02 12:56:51'),
(49, 17, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-04 at 08:00', 0, 22, NULL, '2026-04-02 13:02:09'),
(50, 1, 'admin', 'user_registered', 'New User Registered', 'Shakti puc centre  has registered on the platform', 0, NULL, NULL, '2026-04-02 13:39:02'),
(51, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'OMKAR DIPAK MUTTE has booked an appointment at PUC Center 1', 0, 23, NULL, '2026-04-03 10:30:52'),
(52, 15, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-05 at 07:30', 0, 23, NULL, '2026-04-03 10:33:48'),
(53, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'OMKAR DIPAK MUTTE has booked an appointment at PUC Center 1', 0, 24, NULL, '2026-04-03 11:09:21'),
(54, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Arun Mishra has booked an appointment at PUC Center 1', 0, 25, NULL, '2026-04-11 18:10:28'),
(55, 12, 'user', 'booking_confirmed', 'Booking Confirmed! 🎉', 'Your booking at PUC Center 1 has been confirmed for 2026-04-13 at 06:00', 0, 25, NULL, '2026-04-11 18:11:30'),
(56, 12, 'user', 'puc_ready', 'PUC Certificate Ready! ✅', 'Your PUC certificate (1234567890) from PUC Center 1 is ready', 0, 25, NULL, '2026-04-11 18:12:59'),
(57, 1, 'admin', 'user_registered', 'New User Registered', 'Prem  has registered on the platform', 0, NULL, NULL, '2026-04-14 19:29:51'),
(58, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'Prem  has booked an appointment at PUC Center 1', 0, 26, NULL, '2026-04-14 19:40:18'),
(59, 1, 'admin', 'user_registered', 'New User Registered', 'shakti Kamble has registered on the platform', 0, NULL, NULL, '2026-04-15 05:15:31'),
(60, 1, 'admin', 'user_registered', 'New User Registered', 'NEW D K PUC CENTER has registered on the platform', 0, NULL, NULL, '2026-04-15 05:15:32'),
(61, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'shakti Kamble has booked an appointment at PUC Center 1', 0, 27, NULL, '2026-04-15 05:15:32'),
(62, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'OMKAR DIPAK MUTTE has booked an appointment at PUC Center 1', 0, 28, NULL, '2026-04-15 09:39:52'),
(63, 1, 'admin', 'user_registered', 'New User Registered', 'Abc has registered on the platform', 0, NULL, NULL, '2026-04-15 11:00:28'),
(64, 1, 'admin', 'user_registered', 'New User Registered', 'John Smith  has registered on the platform', 0, NULL, NULL, '2026-04-15 15:06:13'),
(65, 1, 'admin', 'user_registered', 'New User Registered', 'Arun PUC has registered on the platform', 0, NULL, NULL, '2026-04-16 17:01:41'),
(66, 1, 'admin', 'center_added', 'New Center Added', 'Arun PUC added a new center: ArunPUC', 0, NULL, 1, '2026-04-16 17:24:20'),
(67, 1, 'admin', 'user_registered', 'New User Registered', 'VARUN VIJAY MISHRA has registered on the platform', 0, NULL, NULL, '2026-04-16 17:42:21'),
(68, 1, 'shopOwner', 'new_booking', 'New Booking Received! 📅', 'VARUN VIJAY MISHRA has booked an appointment at ArunPUC', 0, 1, NULL, '2026-04-16 17:42:21');

-- --------------------------------------------------------

--
-- Table structure for table `otps`
--

CREATE TABLE `otps` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `otp` varchar(6) NOT NULL,
  `purpose` enum('booking','registration','password_reset') DEFAULT 'booking',
  `is_verified` tinyint(1) DEFAULT 0,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `verified_at` timestamp NULL DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otps`
--

INSERT INTO `otps` (`id`, `email`, `otp`, `purpose`, `is_verified`, `expires_at`, `created_at`, `verified_at`, `ip_address`, `user_agent`) VALUES
(1, '90secondsvisuals@gmail.com', '766165', 'booking', 1, '2026-04-01 18:47:33', '2026-04-01 18:37:33', '2026-04-01 18:40:59', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(2, '90secondsvisuals@gmail.com', '673441', 'booking', 1, '2026-04-02 06:02:14', '2026-04-02 05:52:14', '2026-04-02 05:52:38', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(3, 'designatavm@gmail.com', '780709', 'booking', 1, '2026-04-02 06:50:45', '2026-04-02 06:40:45', '2026-04-02 06:41:14', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(4, 'designatavm@gmail.com', '818800', 'booking', 1, '2026-04-02 06:56:39', '2026-04-02 06:46:39', '2026-04-02 06:47:02', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(5, 'designatavm@gmail.com', '760894', 'booking', 1, '2026-04-02 07:01:04', '2026-04-02 06:51:04', '2026-04-02 06:51:12', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(6, 'mishra.arun1586@gmail.com', '710162', 'booking', 1, '2026-04-02 08:02:20', '2026-04-02 07:52:20', '2026-04-02 07:52:32', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(7, 'mishra.arun1586@gmail.com', '596736', 'booking', 1, '2026-04-02 08:49:15', '2026-04-02 08:39:15', '2026-04-02 08:39:24', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(8, 'designatavm@gmail.com', '692918', 'booking', 1, '2026-04-02 09:18:58', '2026-04-02 09:08:58', '2026-04-02 09:09:08', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(9, 'designatavm@gmail.com', '115028', 'booking', 1, '2026-04-02 09:23:46', '2026-04-02 09:13:46', '2026-04-02 09:13:54', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(10, 'designatavm@gmail.com', '842137', 'booking', 1, '2026-04-02 09:26:14', '2026-04-02 09:16:14', '2026-04-02 09:16:42', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(11, 'designatavm@gmail.com', '412246', 'booking', 1, '2026-04-02 09:28:35', '2026-04-02 09:18:35', '2026-04-02 09:18:43', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(12, 'designatavm@gmail.com', '999845', 'booking', 1, '2026-04-02 09:35:25', '2026-04-02 09:25:25', '2026-04-02 09:25:32', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(13, 'designatavm@gmail.com', '883300', 'booking', 1, '2026-04-02 09:39:02', '2026-04-02 09:29:02', '2026-04-02 09:29:10', '103.189.184.187', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(14, 'theinfinitytechco@gmail.com', '512955', 'booking', 1, '2026-04-02 11:00:35', '2026-04-02 10:50:35', '2026-04-02 10:50:48', '103.189.184.187', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36'),
(15, 'omkarmutte123@gmail.com', '695081', 'booking', 1, '2026-04-02 11:30:42', '2026-04-02 11:20:42', '2026-04-02 11:22:35', '2401:4900:5307:9f6f:78c1:4b9b:f2c9:3f7a', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(16, 'merpremkamble555@gmail.com', '698821', 'booking', 0, '2026-04-02 12:07:35', '2026-04-02 11:57:35', NULL, '1.39.26.137', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'),
(17, 'shubh@gmail.com', '926631', 'booking', 1, '2026-04-02 13:06:39', '2026-04-02 12:56:39', '2026-04-02 12:56:50', '2402:3a80:18da:4f7f:9:bb1b:e10f:4885', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36'),
(18, 'shaktikamble1990@gmail.com', '771552', 'booking', 0, '2026-04-02 13:37:02', '2026-04-02 13:27:02', NULL, '2402:3a80:18c2:e097:320d:a815:6d86:c498', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36'),
(19, 'omkarmutte123@gmail.com', '684350', 'booking', 1, '2026-04-03 10:40:26', '2026-04-03 10:30:26', '2026-04-03 10:30:52', '2409:40c2:310a:8895:dc63:53f1:ef21:54c6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.67'),
(20, 'omkarmutte123@gmail.com', '164840', 'booking', 1, '2026-04-03 11:18:41', '2026-04-03 11:08:41', '2026-04-03 11:09:21', '2409:40c2:310a:8895:dc63:53f1:ef21:54c6', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.67'),
(21, 'designatavm@gmail.com', '388884', 'booking', 1, '2026-04-11 18:20:14', '2026-04-11 18:10:14', '2026-04-11 18:10:28', '103.189.184.237', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(22, 'mepremkamble555@gmail.com', '987403', 'booking', 1, '2026-04-14 19:41:55', '2026-04-14 19:31:55', '2026-04-14 19:32:06', '2402:3a80:18db:8169:6025:eb20:7949:a48a', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36'),
(23, 'mepremkamble555@gmail.com', '696456', 'booking', 1, '2026-04-14 19:42:49', '2026-04-14 19:32:49', '2026-04-14 19:33:11', '2402:3a80:18db:8169:6025:eb20:7949:a48a', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36'),
(24, 'mepremkamble555@gmail.com', '209946', 'booking', 1, '2026-04-14 19:50:07', '2026-04-14 19:40:07', '2026-04-14 19:40:17', '2402:3a80:18db:8169:6025:eb20:7949:a48a', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Mobile Safari/537.36'),
(25, 'shaktikamble1990@gmail.com', '704651', 'booking', 1, '2026-04-15 05:24:38', '2026-04-15 05:14:38', '2026-04-15 05:15:30', '2402:3a80:18de:b053:a443:2074:ba17:9b9a', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Mobile Safari/537.36'),
(26, 'omkarmutte123@gmail.com', '202300', 'booking', 1, '2026-04-15 09:49:14', '2026-04-15 09:39:14', '2026-04-15 09:39:52', '2401:4900:1c2d:3958:3c15:a9d1:dfcd:50e5', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36'),
(27, 'theinfinitytechco@gmail.com', '397793', 'booking', 1, '2026-04-16 17:51:45', '2026-04-16 17:41:45', '2026-04-16 17:42:21', '103.189.184.143', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36');

-- --------------------------------------------------------

--
-- Table structure for table `shop_owners`
--

CREATE TABLE `shop_owners` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'shopOwner',
  `status` enum('active','inactive') DEFAULT 'active',
  `subscription` enum('active','paused') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `shop_owners`
--

INSERT INTO `shop_owners` (`id`, `name`, `email`, `phone`, `password`, `role`, `status`, `subscription`, `created_at`, `updated_at`) VALUES
(1, 'Arun PUC', 'arunmishra@gmail.com', '9326261416', '$2y$10$vhoT2kQLvBWwX.sl1adIfO7kr.qapOndFBZGPl23hk1vHEGt97c5.', 'shopOwner', 'active', 'active', '2026-04-16 17:01:41', '2026-04-16 17:01:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT 'user',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'VARUN VIJAY MISHRA', 'theinfinitytechco@gmail.com', '9326261416', '$2y$10$dTEGuQzRX2mjbEB.Kz0iH.xWXP5T7aBlvFO.jBxShacvd7.vWlY1a', 'user', 'active', '2026-04-16 17:42:21', '2026-04-16 17:42:21');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `number` varchar(20) NOT NULL,
  `type` enum('2W','3W','4W','Commercial') DEFAULT NULL,
  `brand` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `fuel` enum('Petrol','Diesel') NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `user_id`, `number`, `type`, `brand`, `model`, `fuel`, `created_at`, `updated_at`) VALUES
(1, 1, 'MH12JH1234', '', 'Maruti', 'Swift', 'Petrol', '2026-04-16 17:42:21', '2026-04-16 17:42:21'),
(2, 1, 'MH12JH1268', 'Commercial', 'Maruti', 'Swiftt', 'Diesel', '2026-04-16 17:44:40', '2026-04-16 17:52:55'),
(3, 1, 'TEST1234', '', 'Test', 'Test', 'Petrol', '2026-04-16 17:47:06', '2026-04-16 17:47:06'),
(4, 1, 'TEST2W', '2W', 'Test', 'Test', 'Petrol', '2026-04-16 17:48:10', '2026-04-16 17:48:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_center` (`center_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_date` (`date`);

--
-- Indexes for table `centers`
--
ALTER TABLE `centers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_owner` (`owner_id`),
  ADD KEY `idx_city` (`city`),
  ADD KEY `idx_state` (`state`),
  ADD KEY `idx_pincode` (`pincode`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_role` (`user_id`,`user_role`),
  ADD KEY `idx_read` (`is_read`),
  ADD KEY `idx_created` (`created_at`);

--
-- Indexes for table `otps`
--
ALTER TABLE `otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_otp` (`otp`),
  ADD KEY `idx_expires` (`expires_at`),
  ADD KEY `idx_verified` (`is_verified`);

--
-- Indexes for table `shop_owners`
--
ALTER TABLE `shop_owners`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_subscription` (`subscription`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_number` (`number`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `centers`
--
ALTER TABLE `centers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `contact_submissions`
--
ALTER TABLE `contact_submissions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT for table `otps`
--
ALTER TABLE `otps`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `shop_owners`
--
ALTER TABLE `shop_owners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

-- --------------------------------------------------------

--
-- Structure for view `booking_details`
--
DROP TABLE IF EXISTS `booking_details`;

CREATE ALGORITHM=UNDEFINED DEFINER=`u980004958_bookmypuc`@`127.0.0.1` SQL SECURITY DEFINER VIEW `booking_details`  AS SELECT `b`.`id` AS `id`, `b`.`user_id` AS `user_id`, `u`.`name` AS `user_name`, `u`.`email` AS `user_email`, `u`.`phone` AS `user_phone`, `b`.`center_id` AS `center_id`, `c`.`name` AS `center_name`, `c`.`address` AS `center_address`, `c`.`city` AS `city`, `c`.`state` AS `state`, `c`.`owner_id` AS `owner_id`, `so`.`name` AS `shop_owner_name`, `b`.`vehicle_id` AS `vehicle_id`, `v`.`number` AS `vehicle_number`, `v`.`type` AS `vehicle_type`, `v`.`brand` AS `vehicle_brand`, `v`.`model` AS `vehicle_model`, `v`.`fuel` AS `vehicle_fuel`, `b`.`date` AS `date`, `b`.`time` AS `time`, `b`.`status` AS `status`, `b`.`price` AS `price`, `b`.`puc_number` AS `puc_number`, `b`.`certificate` AS `certificate`, `b`.`created_at` AS `created_at`, `b`.`updated_at` AS `updated_at` FROM ((((`bookings` `b` join `users` `u` on(`b`.`user_id` = `u`.`id`)) join `centers` `c` on(`b`.`center_id` = `c`.`id`)) join `shop_owners` `so` on(`c`.`owner_id` = `so`.`id`)) join `vehicles` `v` on(`b`.`vehicle_id` = `v`.`id`)) ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `centers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `centers`
--
ALTER TABLE `centers`
  ADD CONSTRAINT `centers_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `shop_owners` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD CONSTRAINT `vehicles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
