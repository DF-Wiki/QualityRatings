<?php

$wgQualityRatings = array(
	'Tattered',
	'Fine',
	'Superior',
	'Exceptional',
	'Masterwork',
	-1 => 'Unknown',
);

class QualityRatingHandler {
	private static $ratingCache = array();
	public static function toTitle ($title) {
		if (!($title instanceof Title)) {
			$title = Title::newFromText((string)$title);
		}
		return $title;
	}
	public static function getRatingData ($title) {
		$title = self::toTitle($title);
		$title = Title::newFromText($title->getPrefixedDBkey() . '/rating_log');
		print($title->getPrefixedDBkey());
	}
	public static function getRating ($title) {
		$title = self::toTitle($title);
		$dbkey = $title->getPrefixedDBkey();
		if (!array_key_exists($dbkey, self::$ratingCache)) {
			self::$ratingCache[$dbkey] = 1;
		}
		return self::$ratingCache[$dbkey];
	}
}


class QualityRatingHooks {
	public static function includeModules ($outPage) {
		$outPage->addModules('ext.QualityRatings');
		return true;
	}
}
