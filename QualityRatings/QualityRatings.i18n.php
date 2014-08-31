<?php

$messages = array();

$messages['en'] = array(
	'rater-enable-ns' => '',
	'rater-disable-ns' => "*Special\n*File",
);

$messages['qqq'] = array(
	'rater-enable-ns' => 'List of namespaces where rating script is enabled',
	'rater-disable-ns' => 'List of namespaces where rating script is disabled',
);

$QRFunctions = array(
	'colorconvert',
	'strlen',
	'substr',
	'strsplit',
	'strpos',
	'strrpos',
	'stripos',
	'strripos',
	'strstr',
	'stristr',
	'strcount',
	'stricount',
	'strc',
	'char',
	'sha1',
	'md5',
	'splitrand',
	'randint',
	'param',
	'ordinal',
);

$magicWords = array();
$magicWords['en'] = array();
foreach ($QRFunctions as $f) {
    $magicWords['en'][$f] = array(0, $f);
}

