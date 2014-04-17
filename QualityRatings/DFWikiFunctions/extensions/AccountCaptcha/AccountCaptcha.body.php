<?php
class AccountCaptcha {
    public static function generateToken($token) {
        global $ACTokenFunctions;
        foreach ($ACTokenFunctions as $func) {
            $token = call_user_func($func, $token);
        }
        return $token;
    }
    public static function fuzzToken($username) {
        $len = strlen($username);
        $sum = 0;
        for ($i = 0; $i < $len; $i++) {
            // Tokens should be ASCII, so this should work
            $sum += ord($i);
        }
        $seed = rand();
        srand($sum);
        for ($i = 0; $i < rand(1, 3); $i++) {
            $username[rand(0, $len - 1)] = '+';
            $username[rand(0, $len - 1)] = '\\';
            $username[rand(1, $len - 2)] = ' ';  // Avoid spaces at beginning or end
        }
        $username = strrev($username) . "\\";
        
        // change back to random seed
        srand($seed);
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
