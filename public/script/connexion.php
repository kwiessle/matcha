<?php
    $bdd = new PDO("mysql:host=localhost;dbname=matcha", "root", "root");
    
    if ($_POST['account'] === "Send")
    {
        if (!empty($_POST['username']))
        {
            if (!empty($_POST['email']) AND !empty($_POST['confirm-email']))
            {
                if ($_POST['email'] === $_POST['confirm-email'])
                {
                   if (!empty($_POST['password']) AND !empty($_POST['confirm-password']))
                   {
                       if ($_POST['password'] === $_POST['confirm-password'])
                       {
                           if (!empty($_POST['sexe']))
                           {
                               $login = htmlentities(trim($_POST['username']));
                               $email = htmlentities(trim($_POST['confirm-email']));
                               $password = sha1(htmlentities($_POST['confirm-password']));
                               $sexe = $_POST['sexe'];
                               $token = sha1(uniqid());
                               if (preg_match("/^[_a-z0-9-]+(\.[_a-z0-9-]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,3})$/", $email))
                               {
                                   $new_user = $bdd->prepare("INSERT INTO users(login, email, password, sexe, token) VALUES(?, ?, ?, ?, ?)");
                                   $new_user->execute(array($login, $email, $password, $sexe, $token));
                                   $ret = "Acount registred";
                               } else {$ret = "Invalid e-mail format.";}
                           } else {$ret = "Please select a sexe";}
                       } else {$ret = "Passwords doesn't match.";}
                   } else {$ret = "Please type a password.";}
                } else {$ret = "E-mails doesn't match.";}
            } else {$ret = "Please type an email.";}
        } else {$ret = "Please type an username.";}
    }
    
    if ($_POST['login'] === "Send")
    {
        if (!empty($_POST['username']))
        {
            if (!empty($_POST['password']))
            {
                $login = htmlentities(trim($_POST['username']));
                $password = sha1(htmlentities($_POST['password']));
                $user_exist = $bdd->prepare("SELECT * FROM users WHERE login = ? AND password = ? AND confirmation = 1");
                $user_exist->execute(array($login, $password));
                $checker = $user_exist->rowCount();
                if ($checker == 1)
                {
                    $user_info = $user_exist->fetch();
                    $_SESSION['id'] = $user_info['id'];
                    $_SESSION['login'] = $user_info['login'];
                    $_SESSION['email'] = $user_info['email'];
                    $_SESSION['sexe'] = $user_info['sexe'];
                    echo '<script language="javascript">document.location.href="profile.php";</script>';
                } else {$ret = "User doesn't exist or wrong paassword.";}
            } else {$ret = "Pleas type a password.";}
        } else {$ret = "Please type your username.";}
    }
?>