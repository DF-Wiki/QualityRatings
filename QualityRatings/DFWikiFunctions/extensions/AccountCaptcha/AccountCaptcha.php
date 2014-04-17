<?php
$ACTokenFunctions = array(
    'ACTokens::generateToken',
    'AccountCaptcha::fuzzToken',
);
require_once(__DIR__ . '/Tokens.php');
require_once(__DIR__ . '/AccountCaptcha.body.php');

$wgHooks['UserCreateForm'][] = 'AccountCaptchaHooks::UserCreateForm';
$wgHooks['AbortNewAccount'][] = 'AccountCaptchaHooks::AbortNewAccount';

$ACCredits = array(
    'path' => __FILE__,
    'name' => 'AccountCaptcha',
    'author' => '[[User:Lethosor|Lethosor]]',
    'url' => 'https://github.com/lethosor/mw-account-captcha',
    'descriptionmsg' => 'accountcaptcha-desc',
    'version' => '0.0.0',
);

$wgExtensionCredits['antispam'][] = $wgExtensionCredits['specialpage'][] = $ACCredits;

$wgExtensionMessagesFiles['AccountCaptcha'] = __DIR__ . '/AccountCaptcha.i18n.php';
$wgExtensionMessagesFiles['AccountCaptchaAlias'] = __DIR__ . '/AccountCaptcha.alias.php';
$wgAutoloadClasses['SpecialAccountCaptcha'] = __DIR__ . '/SpecialAccountCaptcha.php';
$wgSpecialPages['AccountCaptcha'] = 'SpecialAccountCaptcha';
