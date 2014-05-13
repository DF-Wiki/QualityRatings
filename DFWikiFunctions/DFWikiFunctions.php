<?php

if (!defined('TESTWIKI')) {
	require_once 'extensions/DFDiagram/DFDiagram.php';
	require_once 'extensions/AccountCaptcha/AccountCaptcha.php';
}
global $wgWikiEditorFeatures;
if (!isset($wgWikiEditorFeatures)) {
	require_once 'extensions/WikiEditor/WikiEditor.php';
	global $wgDefaultUserOptions;
	$wgDefaultUserOptions['usebetatoolbar'] = 1;
	$wgDefaultUserOptions['usebetatoolbar-cgd'] = 1;
}
require_once 'extensions/CreatePage/CreatePage.php';
require_once 'tweaks/AutoRedirect.php';

require_once 'Settings.php';

$wgExtensionCredits['DFWikiFunctions'][] = array(
	'path' => __FILE__,
	'name' => 'DFWikiFunctions',
	'author' =>'Lethosor',
	'url' => 'https://github.com/lethosor/DFWikiFunctions',
	'description' => 'Dwarf Fortress wiki modifications and extensions',
	//'version'  => '1.0.5-dev',
);