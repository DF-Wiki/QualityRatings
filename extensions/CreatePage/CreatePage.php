<?php

require_once(__DIR__ . '/CreatePage.body.php');

$wgExtensionCredits['specialpage'][] = array(
    'path' => __FILE__,
    'name' => 'CreatePage',
    'author' => 'Lethosor',
    'url' => 'https://github.com/lethosor/DFWikiFunctions',
    'descriptionmsg' => 'createpage-desc',
    'version' => '0.2.1',
);

$wgExtensionMessagesFiles['CreatePage'] = __DIR__ . '/CreatePage.i18n.php';
$wgExtensionMessagesFiles['CreatePageAlias'] = __DIR__ . '/CreatePage.alias.php';
$wgAutoloadClasses['SpecialCreatePage'] = __DIR__ . '/SpecialCreatePage.php';
$wgSpecialPages['CreatePage'] = 'SpecialCreatePage';
