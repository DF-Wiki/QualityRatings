<?php

require_once "inc/Char.php";

$QRFunctions = array(
	'colortype',
	'colorconvert',
	'colorconvertto',
	'colorfg',
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
	'randorder',
	'randint',
	'param',
	'ordinal',
);
$QRFunctionFlags = array(
	'randorder' => SFH_OBJECT_ARGS,
	'param' => SFH_OBJECT_ARGS,
);


class QualityRatingHooks {
	public static function includeModules ($outPage) {
		$outPage->addModules('ext.QualityRatings');
		return true;
	}
	public static function init (&$parser) {
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
	private static function in_range($n, $a, $b) {
		return $n >= $a && $n <= $b;
	}
	public static function error ($parser, $text /* , ... */) {
		if ($parser !== false) {
			$args = func_get_args();
			array_shift($args);
			return '<span class="error">' . implode($args, ' ') . '</span>';
		}
		else return false;
	}
	public static function colortype ($parser, $color='') {
		global $QRColorFormats;
		foreach ($QRColorFormats as $id => $fmt) {
			if ($fmt['decode']($color) !== false)
				return $id;
		}
	}
	public static function colorconvert ($parser, $color='', $from='', $to='') {
		global $QRColorFormats;
		if (!array_key_exists($from, $QRColorFormats) || !array_key_exists($to, $QRColorFormats)) {
			return self::error($parser, "Invalid color format");
		}
		$decoded = $QRColorFormats[$from]['decode']($color);
		if ($decoded === false) {
			return self::error($parser, "Invalid $from color: '$color'");
		}
		return $QRColorFormats[$to]['encode']($decoded);
	}
	public static function colorconvertto ($parser, $color='', $to='') {
		$from = self::colortype($parser, $color);
		return self::colorconvert($parser, $color, $from, $to);
	}
	public static function colorfg ($parser, $color='', $fmt='hex') {
		global $QRColorFormats;
		$rgb = self::colorconvertto(false, $color, 'rgb');
		if ($rgb === false)
			return self::error($parser, 'Unrecognized color');
		$rgb = $QRColorFormats['rgb']['decode']($rgb);
		$brightness = ($rgb[0] * 0.299) + ($rgb[1] * 0.587) + ($rgb[2] * 0.114);
		$fg = $brightness > 160 ? '#000000' : '#ffffff';
		return ($fmt == 'hex') ? $fg :
			(self::colorconvert(false, $fg, 'hex', $fmt) || $fg);
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

	public static function randorder ($parser, $frame, $args) {
		shuffle($args);
		foreach ($args as $i => $a) {
			$args[$i] = $frame->expand($a);
		}
		return implode('', $args);
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
	public static function ordinal ($parser /* , ... */) {
		$args = func_get_args();
		array_shift($args);
		$endings = array('th', 'st', 'nd', 'rd');
		$number = '';
		foreach ($args as $a) {
			if (strlen($a) > 2 && strpos('0123', $a[0]) !== false && $a[1] == '=')
				$endings[$a[0]] = substr($a, 2);
			elseif ($number == '')
				$number = $a;
		}
		$number = (int)$number;
		if (self::in_range($number % 100, 11, 13))
			$ending = 0;
		elseif (self::in_range($number % 10, 1, 3))
			$ending = $number % 10;
		else
			$ending = 0;
		return $number . $endings[$ending];
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
			return (count($matches) == 3) ? $matches : false;
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

