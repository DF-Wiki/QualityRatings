<?php

class QualityRatingHooks {
	static public function includeModules ($outPage) {
		$outPage->addModules('ext.QualityRatings');
		return true;
	}
	static public function getPreferences ($user, &$preferences) {
		return true;
	}
}
