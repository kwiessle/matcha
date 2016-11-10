<?PHP

include 'database.php';
$bdd = new PDO( $DB_DSN, $DB_USER, $DB_PASSWORD, array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION));
try {
	$req = $bdd->prepare("CREATE DATABASE IF NOT EXISTS matcha;");
	$req->execute();
	$users_table = $bdd->prepare("CREATE TABLE IF NOT EXISTS `matcha`.`users` ( `id` INT(5) NOT NULL AUTO_INCREMENT , `email` VARCHAR(255) NOT NULL , `firstname` VARCHAR(255) NOT NULL , `lastname` VARCHAR(255) NOT NULL , `password` VARCHAR(255) NOT NULL , `age` VARCHAR(255) NOT NULL , `sexe` BOOLEAN NOT NULL , `localisation` VARCHAR(255) NOT NULL , `confirmation` INT(1) NOT NULL DEFAULT '0' , `token` VARCHAR(255) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
	$users_table->execute();
	$profil_table = $bdd->prepare("CREATE TABLE IF NOT EXISTS `matcha`.`profil` ( `id_usr` INT(5) NOT NULL , `photo_usr` VARCHAR(255) NOT NULL , `photos_set` VARCHAR(255) NOT NULL , `orientation` VARCHAR(255) NOT NULL DEFAULT 'bisexuel' , `like` VARCHAR(255) NOT NULL , `unlike` VARCHAR(255) NOT NULL , `match` VARCHAR(255) NOT NULL , `blacklist` VARCHAR(255) NOT NULL , `hashtag` VARCHAR(255) NOT NULL , `history` VARCHAR(255) NOT NULL ) ENGINE = InnoDB;");
	$profil_table->execute();
	$hashtag_table = $bdd->prepare("CREATE TABLE IF NOT EXISTS `matcha`.`hashtag` ( `id` INT(3) NOT NULL AUTO_INCREMENT , `name` VARCHAR(255) NOT NULL , PRIMARY KEY (`id`)) ENGINE = InnoDB;");
	$hashtag_table->execute();
	$report_table = $bdd->prepare("CREATE TABLE IF NOT EXISTS `matcha`.`report` ( `id_usr` INT(5) NOT NULL , `nb_report` INT(1) NOT NULL DEFAULT '0' ) ENGINE = InnoDB;");
	$report_table->execute();
}

catch (PDOexception $e)
{
	print "Erreur :".$e->getMEssage()."";
	die();
}
