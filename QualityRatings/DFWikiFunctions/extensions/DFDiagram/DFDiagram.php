<?php
/*
 * DFDiagram
 * MediaWiki extension for including Dwarf Fortress diagrams
 *
 * This is the file that should be included by LocalSettings.php
 */
if (!isset($wgDFDConfigFile)) {
	$wgDFDConfigFile = "$IP/extensions/DFDiagram/diagram_config.txt";
}
if (!isset($wgDFDDefaultDiagramPath)) {
	$wgDFDDefaultDiagramPath = "$IP/extensions/DFDiagram/default_diagram.txt";
}

require_once 'Diagram.php';
$wgExtensionMessagesFiles['DFDiagram'] = dirname( __FILE__ ) . '/DFDiagram.i18n.php';

#$DFDFile = new DFDBlockFile($wgDFDConfigFile);

/*
 * Add hooks
 */

#$wgHooks['ParserFirstCallInit'][] = 'DFDMWHooks::init';

$wgResourceModules['ext.DFDiagram'] = array(
	'styles' => "modules/ext.DFDiagram.css",
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'DFDiagram'
);

$wgResourceModules['ext.DFDiagram.canvas'] = array(
	'scripts' => array(
		'modules/df-tileset/df-tileset.js',
		'modules/ext.DFDiagram.js',
	),
	'localBasePath' => __DIR__,
	'remoteExtPath' => 'DFDiagram'
);

#$wgHooks['BeforePageDisplay'][] = 'DFDMWHooks::includeModules';

#$wgHooks['GetPreferences'][] = 'DFDMWHooks::getPreferences';
#$wgDefaultUserOptions['dfdiagram-use-canvas'] = true;

/*
 * Credits for Special:Version
 */

$wgExtensionCredits['DFDiagram'][] = array(
	'path' => __FILE__,
	'name' => 'DFDiagram',
	'author' =>'Lethosor',
	'url' => 'https://github.com/lethosor/DFDiagram',
	'description' => 'Adds support for DF-style diagrams',
	'version'  => '0.4',
);

