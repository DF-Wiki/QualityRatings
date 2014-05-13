<?php

class VarDict {
	/**
	 * Variable dictionary (simplified from a native array)
	 *
	 * Intended for use with the variable tags ([$...]) in diagrams
	 */
	private $arr;
	public function __construct() {
		$this->arr = array();
	}
	public function get($name, $default='') {
		if (array_key_exists($name, $this->arr)) {
			return $this->arr[$name];
		}
		else {
			return $default;
		}
	}
	public function set($name, $value) {
		$this->arr[$name] = $value;
		return $value;
	}
}

?>
