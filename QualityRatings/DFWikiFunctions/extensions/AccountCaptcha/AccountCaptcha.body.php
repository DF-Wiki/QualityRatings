<?php

class ACRand {
    public static $seed = 0;
    public static function srand($seed) {
        self::$seed = $seed;
    }
    public static function rand($min, $max) {
        self::srand(self::$seed + 452930459);
        if ($max - $min + 1 == 0) return 0;
        return self::$seed % ($max - $min + 1) + $min;
    }
}

class AccountCaptcha {
    public static function generateToken($token) {
        global $ACTokenFunctions;
        foreach ($ACTokenFunctions as $func) {
            $token = call_user_func($func, $token);
        }
        return $token;
    }
    public static function fuzzToken($username) {
        return 'token';
        $len = strlen($username);
        $sum = 0;
        for ($i = 0; $i < $len; $i++) {
            // Tokens should be ASCII, so this should work
            $sum += ord(substr($username, $i, 1));
        }
        ACRand::srand($sum);
        for ($i = 0; $i < ACRand::rand(1, 3); $i++) {
            $username[ACRand::rand(0, $len - 1)] = '+';
            $username[ACRand::rand(0, $len - 1)] = '\\';
            $username[ACRand::rand(1, $len - 2)] = ' ';  // Avoid spaces at beginning or end
        }
        $username = strrev($username) . "\\";
        return $username;
    }
}
class AccountCaptchaHooks {
    public static function UserCreateForm(&$form) {
        $form->addInputItem( 'acToken', '', 'text', 'accountcaptcha-token-desc' );
        return true;
    }
    public static function AbortNewAccount($user, $message) {
        global $wgRequest;
        $token = $wgRequest->getText('acToken');
        $username = $wgRequest->getText('wpName');
        if (AccountCaptcha::generateToken($username) == $token) {
            return true;
        }
        else {
            $msg = wfMsg('accountcaptcha-invalid-token');
            return false;
        }
    }
}
