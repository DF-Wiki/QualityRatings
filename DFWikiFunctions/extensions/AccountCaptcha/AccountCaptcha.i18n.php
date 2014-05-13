<?php
/**
 * Internationalisation for AccountCaptcha
 */
$messages = array();
 
/** English
 * @author Lethosor
 */
$messages[ 'en' ] = array(
	'accountcaptcha' => "AccountCaptcha",
	'accountcaptcha-desc' => "Methods for dealing with spam account creation",
        'accountcaptcha-form-text' => <<<TEXT
Enter the username you want to use in the form below to get your token. Be sure
to use the '''exact''' username you entered in the account creation form. It
may be safest to copy and paste it here.
TEXT
,
        'accountcaptcha-result-text' => <<<TEXT
This is the token you will need to create an account. Copy it '''exactly'''
into the account creation form as it appears here.
TEXT
,
        'accountcaptcha-token-desc' =>
'You must [[Special:AccountCaptcha|obtain a token]] in order to create an account',
        'accountcaptcha-invalid-token' => 'The token you have entered is invalid. Please submit the form again.'
);
 
/** Message documentation
 * @author Lethosor
 */
$messages[ 'qqq' ] = array(
	'accountcaptcha' => "AccountCaptcha name displayed on [[Special:SpecialPages]]",
	'accountcaptcha-desc' => "AccountCaptcha description",
        'accountcaptcha-form-text' => "Text displayed when entering a username",
        'accountcaptcha-result-text' => "Text displayed when recieving a token",
        'accountcaptcha-token-desc' => "Text displayed on login form next to token text box",
        'accountcaptcha-invalid-token' => "Message displayed if token entered on login form is incorrect",
);
