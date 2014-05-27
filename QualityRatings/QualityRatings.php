<?php

require_once 'QualityRatings.body.php';
if (!defined('TESTWIKI')) {
    require_once 'DFWikiFunctions/DFWikiFunctions.php';
}

$wgResourceModules['ext.QualityRatings'] = array(
	'scripts' => array(
		'../rater.js',
		'modules/jquery.color-2.1.0.min.js'
	),
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'QualityRatings',
	'messages' => array(
		'rater-enable-ns',
		'rater-disable-ns',
	),
);

$wgHooks['BeforePageDisplay'][] = 'QualityRatingHooks::includeModules';
$wgHooks['ParserFirstCallInit'][] = 'QualityRatingHooks::init';
$wgExtensionMessagesFiles['QualityRatings'] = __DIR__ . '/QualityRatings.i18n.php';


/*
 * Credits for Special:Version
 */

$wgExtensionCredits['QualityRatings'][] = array(
	'path' => __FILE__,
	'name' => 'QualityRatings',
	'author' =>'[[User:Lethosor|Lethosor]]',
	'url' => 'https://github.com/lethosor/dfwiki-rater',
	'description' => 'Dwarf Fortress wiki rating script',
	'version'  => '1.0.5-dev-test2',
);

