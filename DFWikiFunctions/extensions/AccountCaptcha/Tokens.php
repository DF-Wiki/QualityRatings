<?php
class ACTokens {
    public static function generateToken($username) {
        global $IP;
        return sha1($username . 'x');
    }
}
