<?php

require_once 'QualityRatings.body.php';

$wgResourceModules['ext.QualityRatings'] = array(
	'scripts' => array(
		'../rater.js',
	),
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'QualityRatings',
);

$wgHooks['BeforePageDisplay'][] = 'QualityRatingHooks::includeModules';

/*
 * Credits for Special:Version
 */

$wgExtensionCredits['QualityRatings'][] = array(
	'path' => __FILE__,
	'name' => 'QualityRatings',
	'author' =>'[[User:Lethosor|Lethosor]]',
	'url' => 'https://github.com/lethosor/dfwiki-rater',
	'description' => 'Dwarf Fortress wiki rating script',
	'version'  => '1.0',
);

