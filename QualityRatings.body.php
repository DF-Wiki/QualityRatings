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
	private static $defaultLogEntry = array(
		'rating' => -1,
	);
	public static function toTitle ($title) {
		if (!($title instanceof Title)) {
			$title = Title::newFromText((string)$title);
		}
		return $title;
	}
	public static function getRatingData ($title) {
		$title = self::toTitle($title);
		$title = Title::newFromText($title->getPrefixedDBkey() . '/rating_log');
		$content = WikiPage::factory($title)->getText();
		$data = json_decode($content, true);   // Return objects as arrays
		if (!is_array($data)) {
			// Log does not exist
			return array(self::$defaultLogEntry);
		}
		foreach ($data as $k => $d) {
			if (!is_array($d)) {
				$data[$k] = self::$defaultLogEntry;
			}
		}
		return $data;
	}
	public static function getRating ($title) {
		$title = self::toTitle($title);
		$dbkey = $title->getPrefixedDBkey();
		if (!array_key_exists($dbkey, self::$ratingCache)) {
			$data = self::getRatingData($title);
			$data = end($data);
			self::$ratingCache[$dbkey] = $data['rating'];
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
