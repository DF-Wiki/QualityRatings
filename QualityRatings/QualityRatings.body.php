<?php

require_once "inc/Char.php";

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
);
$QRFunctionFlags = array(
	'param' => SFH_OBJECT_ARGS,
);


class QualityRatingHooks {
	public static function includeModules ($outPage) {
		$outPage->addModules('ext.QualityRatings');
		return true;
	}
	public static function init (&$parser) {
		global $wgRegexFunctionsPerPage;
		$wgRegexFunctionsPerPage = 1000;
		global $QRFunctions, $QRFunctionFlags;
		foreach ($QRFunctions as $f) {
			$parser->setFunctionHook($f, "QualityRatingFuncs::$f",
				array_key_exists($f, $QRFunctionFlags) ? $QRFunctionFlags[$f] : 0
			);
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
	public static function strsplit ($parser, $str, $delim, $return='$1', $limit=10000) {
		$parts = explode($delim, $str, (int)$limit);
		$parts[-1] = $str;
		$return = preg_replace('/^\d+$/', "\$$0", $return);
		return preg_replace_callback('/\$\{?(\d+)\}?/', function($matches) use ($parts){
			$key = (int)$matches[1];
			if ($key <= count($parts) && $key >= 0) {
				// 1 = first element
				return $parts[$key-1];
			}
			return $matches[0];
		}, $return);
	}
	public static function strpos ($parser, $str, $sub, $start=0) {
		return mb_strpos($str, $sub, (int)$start);
	}
	public static function strrpos ($parser, $str, $sub, $start=0) {
		return mb_strrpos($str, $sub, (int)$start);
	}
	public static function stripos ($parser, $str, $sub, $start=0) {
		return mb_stripos($str, $sub, (int)$start);
	}
	public static function strripos ($parser, $str, $sub, $start=0) {
		return mb_strripos($str, $sub, (int)$start);
	}
	public static function strstr ($parser, $str, $sub, $before=0) {
		return mb_strstr($str, $sub, (bool)$before) || '';
	}
	public static function stristr ($parser, $str, $sub, $before=0) {
		return mb_stristr($str, $sub, (bool)$before) || '';
	}
	public static function strcount ($parser, $str, $sub) {
		return mb_substr_count($str, $sub);
	}
	public static function stricount ($parser, $str, $sub) {
		return mb_substr_count(mb_strtolower($str), mb_strtolower($sub));
	}
	public static function strc ($parser, $str) {
		// Convert escape characters into the characters they represent
		$str = preg_replace('/\\[0ab]/', '', $str);
		return stripcslashes($str);
	}
	public static function sha1 ($parser, $str) {
		return sha1($str);
	}
	public static function md5 ($parser, $str) {
		return md5($str);
	}
	public static function splitrand ($parser, $str, $delim="\n") {
		$parts = explode($delim, $str);
		return $parts[mt_rand(0, count($parts) - 1)];
	}
	public static function char ($parser, $id) {
		$id = max(1, min(255, (int)$id));
		$ch = new QualityRatings\Char\Char($id);
		return $ch->text;
	}
	
	public static function randint ($parser, $a, $b=1) {
		$a = (int)$a; $b = (int)$b;
		if ($a < $b) return mt_rand($a, $b);
		else return mt_rand($b, $a);
	}
	public static function param ($parser, $frame, $args) {
		/**
		 * #param: Returns the first template parameter found in a list of parameter names
		 *
		 * The following wikitext is equivalent:
		 * {{{param1|{{{param2|{{{param3|{{{param4|None of the parameters were found}}}}}}}}}}}
		 * {{#param:param1|param2|param3|param4|None of the parameters were found}}
		 *
		 * @param $args array: The arguments passed to the parser function
		 */
		// Expand all PPFrame_DOM objects into wikitext
		for ($i = 0; $i < count($args); $i++) {
			$args[$i] = $frame->expand($args[$i]);
		}
		// Last argument is default, like {{{1|default}}}
		$default = array_pop($args);
		// Arguments passed to template
		$frameArgs = $frame->getArguments();
		foreach ($args as $arg) {
			if (array_key_exists($arg, $frameArgs)) {
				return $frameArgs[$arg];
			}
		}
		// Nothing returned from loop, so none of the specified arguments were found
		return $default;
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

