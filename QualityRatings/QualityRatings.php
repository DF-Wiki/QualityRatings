<?php

require_once 'QualityRatings.body.php';

$wgResourceModules['ext.QualityRatings'] = array(
	'scripts' => array(
		'../rater.js',
		'modules/jquery.color-2.1.0.min.js'
	),
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'QualityRatings',
);

$wgHooks['BeforePageDisplay'][] = 'QualityRatingHooks::includeModules';
$wgHooks['GetPreferences'][] = 'QualityRatingHooks::getPreferences';

/*
 * Credits for Special:Version
 */

$wgExtensionCredits['QualityRatings'][] = array(
	'path' => __FILE__,
	'name' => 'QualityRatings',
	'author' =>'[[User:Lethosor|Lethosor]]',
	'url' => 'https://github.com/lethosor/dfwiki-rater',
	'description' => 'Dwarf Fortress wiki rating script',
	'version'  => '1.0.2',
);

