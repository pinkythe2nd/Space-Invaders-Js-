<?php

$con = mysqli_connect("localhost","newuser","","leaderboard");
$txtName = $_POST['txtName'];
$score = $_POST['var'];

$sql = "INSERT INTO `scoreboard` (`name`, `score`) VALUES ('$txtName', '$score')";

// insert in database 
$rs = mysqli_query($con, $sql);


if($rs)
{
	echo "Contact Records Inserted";
}

?>