<?php

$QRFunctions = array(
	'colorconvert',
	'strlen',
	'substr',
);

class QualityRatingHooks {
	public static function includeModules ($outPage) {
		$outPage->addModules('ext.QualityRatings');
		return true;
	}
	public static function init (&$parser) {
		global $QRFunctions;
		foreach ($QRFunctions as $f) {
			$parser->setFunctionHook($f, "QualityRatingFuncs::$f");
		}
		return true;
	}
}

class QualityRatingFuncs {
	public static function error ($text) {
		return '<span class="error">' . implode(func_get_args(), ' ') . '</span>';
	}
	public static function colorconvert ($parser, $color='', $from='', $to='') {
		global $QRColorFormats;
		if (!array_key_exists($from, $QRColorFormats) || !array_key_exists($to, $QRColorFormats)) {
			return self::error("Invalid color format");
		}
		$decoded = $QRColorFormats[$from]['decode']($color);
		if ($decoded === false) {
			return self::error("Invalid $from color: '$color'");
		}
		return $QRColorFormats[$to]['encode']($decoded);
	}
	public static function strlen ($parser, $str='') {
		return mb_strlen($str);
	}
	public static function substr ($parser, $str='', $start=0, $length=null) {
		return @mb_substr($str, $start, $length);
	}
}

$QRColorFormats = array(
	'rgb' => array(
		'encode' => function($arr) {
			return "rgb({$arr[0]}, {$arr[1]}, {$arr[2]})";
		},
		'decode' => function($str) {
			$matches = array();
			preg_match('/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/', $str, $matches);
			array_shift($matches);
			return $matches;
		}
	),
	'hex' => array(
		'encode' => function($arr) {
			return '#' . sprintf("%02x%02x%02x", $arr[0], $arr[1], $arr[2]);
		},
		'decode' => function($str) {
			$matches = array();
			preg_match('/#?(([0-9a-fA-F]){3}){1,2}/', $str, $matches);
			if (!count($matches)) { return false; }
			$str = str_replace('#', '', $matches[0]);
			if (strlen($str) == 3) {
				$str = preg_replace('/([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])/', "$1$1$2$2$3$3", $str);
			}
			if (strlen($str) != 6) { return false; }
			return array(
				hexdec(substr($str,0,2)),
				hexdec(substr($str,2,2)),
				hexdec(substr($str,4,2))
			);
		}
	),
	'rgb1' => array(
		'encode' => function($arr) { return $arr[0]; },
		'decode' => function($str) { return false; }
	),
	'rgb2' => array(
		'encode' => function($arr) { return $arr[1]; },
		'decode' => function($str) { return false; }
	),
	'rgb3' => array(
		'encode' => function($arr) { return $arr[2]; },
		'decode' => function($str) { return false; }
	),
);

