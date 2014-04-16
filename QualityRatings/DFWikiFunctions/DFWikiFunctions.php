<?php

require_once 'Settings.php';
if (!defined('TESTWIKI')) {
        #if (isset($_COOKIE) && array_key_exists('debug', $_COOKIE) &&  $_COOKIE['debug'] == 1)
        #        require_once 'extensions/DFDiagram/DFDiagram.php';
}
require_once 'tweaks/CVRedirect.php';

$wgExtensionCredits['DFWikiFunctions'][] = array(
	'path' => __FILE__,
	'name' => 'DFWikiFunctions',
	'author' =>'Lethosor',
	'url' => 'https://github.com/lethosor/DFWikiFunctions',
	'description' => 'Dwarf Fortress wiki modifications and extensions',
	//'version'  => '1.0.5-dev',
);
