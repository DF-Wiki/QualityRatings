<?php

class QualityRatingHooks {
	public static function includeModules ($outPage) {
		$outPage->addModules('ext.QualityRatings');
		return true;
	}
}
