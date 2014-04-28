<?php
/*
 * Diagram
 *
 * NOTE: DO NOT INCLUDE THIS DIRECTLY VIA LocalSettings.php. This is NOT the main extension
 * file. Include DFDiagram.php instead.
 */

require_once 'Char.php';
require_once 'Color.php';
require_once 'Grid.php';
require_once 'VarDict.php';
function DFDParseTokens($string){
	/*
	 * Takes a string and returns an array of tokens (e.g. Color tags, tiles, etc.)
	 */
	// Convert to UTF-8
	$string = mb_convert_encoding($string, 'UTF-8');

	// True when inside a tag ([...])
	$in_tag = false;
	// Index where current tag begins
	$tag_start = 0;

	$tokens = array();

	for ($index = 0; $index < strlen($string); $index++) {
		$char = mb_substr($string, $index, 1, 'UTF-8');
		if (!mb_strlen($char)) {
			// mb_ functions sometimes end up with empty characters
			continue;
		}
		if ($char == "[") {
			// starts a tag
			$in_tag = true;
			$tag_start = $index;
		}
		elseif ($char == "]") {
			// closes a tag
			$in_tag = false;
			// Use the substring from $tag_start to the current character (INCLUSIVE) as the token
			$tokens[] = mb_substr($string, $tag_start, $index - $tag_start + 1);
		}
		if ($in_tag || $char == ']') {
			// Don't count tags as individual characters!
			continue;
		}
		$tokens[] = $char;
	}
	return $tokens;
}

class DFDBlockFile {
	private $text;
	private $blocks;
	function __construct($path) {
		return;
		$this->text = file_get_contents($path);
		$matches = array();
		preg_match_all('/<(tile|block) name=".*">[\s\S]*?<\/\1>/', $this->text, $matches);
		$this->blocks = array();
		// $matches[0] is list ($1 is list of tile|block)
		foreach($matches as $index => $match){
			//print ">$match<\n";
			$type = $matches[1][$index];
			if ($type == 'tile') {
				$this->blocks[] = new DFDTile($matches[0][$index]);
			}

		}
	}

	function get_block($name){
		/*
		 * Returns a block in $this->block_list with the given name
		 */
		foreach($this->blocks as $block){
			if($block->name == $name){
				return $block;
			}
		}
		return null;
	}
}

class DFDTile {

	public $name;
	function __construct($text) {
		$lines = preg_split('/\n/', $text);
		if (count($lines) != 6) {
			trigger_error("Tag {$lines[0]} does not fit format! Skipping");
		}
		$tag = array();
		preg_match('/<tile name="(.*?)">/', $lines[0], $tag);
		$this->name = $tag[1];
	}
}

class DFDTable {
	/**
	 * Represents the table created by a diagram
	 */
	private $text;
	private $opts;
	private $fg;
	private $bg;
	private $lines;
	private $grid;
	private $vars;
	public function __construct($text, $a_opts) {
		// Opt-independent stuff
		$this->vars = new VarDict();
		// Default options
		$opts = array(
			'fg' => '7:1',
			'bg' => '0:0'
		);
		foreach($opts as $key => $val){
			if(array_key_exists($key, $a_opts)){
				$opts[$key] = $a_opts[$key];
			}
		}
		$this->text = $text;
		$this->opts = $opts;
		$this->fg = $opts['fg'];
		$this->bg = $opts['bg'];
		$this->setUp();
	}
	public function setUp(){
		/*
		 * Set up table
		 */

		$fgcolor = $this->fg;
		$bgcolor = $this->bg;

		// Parse variables first - otherwise, characters won't be displayed properly

		$var_tags = array();
		preg_match_all('/\[\$[^]]+\]/', $this->text, $var_tags);
		if (count($var_tags) && $var_tags[0] != null) {
			foreach ($var_tags[0] as $i => $tag) {
				// preg escaped
				$esc_tag = '\[\$' . substr($tag, 2, -1) . '\]';
				if (preg_match('/=/', $tag)) {
					// Assignment
					$parts = preg_split('/=/', $tag, 2);
					$vname = substr($parts[0], 2);
					$val = substr($parts[1], 0, -1);
					$this->vars->set($vname, $val);
					$this->text = preg_replace('/' . $esc_tag . '/', '', $this->text);
				}
				else {
					// variable name
					$vname = substr($tag, 2, -1);
					// Replace 1 occurence of the tag (therefore the first occurence) with the variable's value
					$this->text = preg_replace('/\[\$' . $vname . '\]/', $this->vars->get($vname), $this->text, 1);
				}
			}
		}

		// Clean up blank lines
		$this->text = preg_replace('/\n+/', "\n", $this->text);
		// And possible lines at the beginning
		$this->text = preg_replace('/^\n+/', '', $this->text);

		// Set up grid
		$this->grid = new DGrid();
		$this->lines = preg_split('/\n/', $this->text);

		// Parse tokens
		$this->tokens = array();
		for ($row = 0; $row < count($this->lines); $row++) {
			$this->tokens[$row] = DFDParseTokens($this->lines[$row]);
		}


		for ($row = 0; $row < count($this->tokens); $row++) {
			$tokens = $this->tokens[$row];
			$col = -1;
			for ($i = 0; $i < count($tokens); $i++) {
				$token = $tokens[$i];
				if(mb_strlen($token) == 1){
					// Character
					$col++;
					$cell = new DFDTableCell($token, $fgcolor, $bgcolor);
					$this->grid->set($row, $col, $cell);
				}
				else {
					// tag
					if ($token == '[#]') {
						// Reset foreground color
						$fgcolor = $this->fg;
					}
					elseif ($token == '[@]') {
						// Reset bg color
						$bgcolor = $this->bg;
					}
					elseif ($token == '[#@]' || $token == '[@#]') {
						// Reset fg and bg
						$bgcolor = $this->bg;
						$fgcolor = $this->fg;
					}
					elseif ($token[1] == '#') {
						// Set fg color
						$fgcolor = substr($token, 2, strlen($token) - 3);
					}
					elseif ($token[1] == '@') {
						// Set bg color
						$bgcolor = substr($token, 2, strlen($token) - 3);
					}
					elseif ($token[1] == '%') {
						// Character
						$col++;
						$char = new Char(substr($token, 2, strlen($token) - 3));
						$cell = new DFDTableCell($char->text, $fgcolor, $bgcolor);
						$this->grid->set($row, $col, $cell);
					}
				}
			}
		}
	}
	public function render(){
		$html = "\n<table>\n";
		for($r = 0; $r < $this->grid->height; $r++) {
			$html .= "\t<tr>";
			// Initial bg/fg colors
			$fg = $this->fg;
			$bg = $this->bg;
			for ($c = 0; $c < $this->grid->width; $c++) {
				$cell = $this->grid->get($r, $c);
				if($cell === false){
					// No cell exists at this row/col; create a blank black cell
					$cell = new DFDTableCell(' ', "$fg", "$bg");
				}
				else {
					// Set fg/bg to current cell's colors
					$fg = $cell->fg;
					$bg = $cell->bg;
				}
				$html .= "<td>{$cell->render()}</td>";
			}
			$html .= "</tr>\n";
		}
		$html .= "</table>";
		return $html;
	}
}

class DFDTableCell {
	/**
	 * An individual cell in a DFDTable
	 *
	 * @property Color $fg The cell's foreground color
	 * @property Color $bg The cell's background color
	 * @property string $text The cell's text (should be one character, but this is not enforced)
	 */
	public $text;
	public $fg;
	public $bg;
	public function __construct($text, $fg, $bg) {
		$this->text = $text;
		$this->fg = new Color($fg);
		$this->bg = new Color($bg);
	}
	public function render(){
		$char = $this->text;
		// &nbsp; is a non-breaking space; without it, the cell doesn't align with other cells properly.
		if($char == ' '){
			$char = '&nbsp;';
		}
		return "<span style=\"display:block; color:{$this->fg}; background-color:{$this->bg};\">{$char}</span>";
	}
}

class DFDiagram {
	/**
	 * Diagram wrapper
	 *
	 * Note that this class uses DFDTable to render the body of the diagram.
	 */

	// A DFDTable
	private $table;
	public static function parseXMLAttrs($string) {
		$string = $string . ' ';
		$attrString = preg_replace('/<\w+\s*([^>]*)>/', "$1", $string);
		$attrString = preg_replace('/(\w+?)=([^"\'\s]+)\s+/', "$1=\"$2\" ", $attrString);
		$attrString = str_replace("'", '"', $attrString);
		$attrs = array();
		$current = "";
		$state = 'name';
		$attrName = '';
		for ($i = 0; $i < mb_strlen($string); $i++) {
			$char = mb_substr($attrString, $i, 1);
			if ($char == '"') {
				if ($state == 'name') {
					$state = 'value';
					$attrName = $current;
				}
				elseif ($state == 'value') {
					$state = 'name';
					$attrs[$attrName] = $current;
				}
				$current = '';
				continue;
			}
			if (preg_match('/\s/', $char) && $state == 'name') {
				continue;
			}
			if ($char == '=' && $state == 'name') {
				continue;
			}
			$current .= $char;
		}
		return $attrs;
	}
	public static function XMLAttrsToDataAttrs($attrs) {
		$text = '';
		foreach ($attrs as $name => $value) {
			$text .= "data-$name=\"$value\" ";
		}
		return $text;
	}
	public function __construct($text, $opts) {
		// Initialize the table with the provided text and options (no processing here)
		//$this->table = new DFDTable($text, $opts);
		if (!array_key_exists('display', $opts))
			$opts['display'] = 'block';
		$opts['display'] = preg_replace('/[^A-Za-z-]/', '', $opts['display']);
		$this->opts = $opts;

		$this->tables = array();
		$frames = array();
		if (!preg_match_all('/\n*<(frame[^>]*)>([\s\S]*?)<\/frame>\n*/', $text, $frames, PREG_SET_ORDER)) {
			// no frames explicitly specified; fall back to a single frame
			$frames[0] = array("<frame>$text</frame>", 'frame', $text); // simulates a regex match
		}
		foreach ($frames as $f) {
			$frameText = $f[2];
			$table = new DFDTable($frameText, $opts);
			$table->frameOptions = DFDiagram::parseXMLAttrs("<{$f[1]}>");
			$this->tables[] = $table;
		}
	}
	public function render() {
		// Render the rendered table, wrapped with render()
		//return $this->format($this->table->render());
		$text = '';
		foreach ($this->tables as $table) {
			$text .= '<div class="dfdiagram-frame" ' . DFDiagram::XMLAttrsToDataAttrs($table->frameOptions)
				. '>' . $table->render() . '</div>';
		}
		return $this->format($text);
	}

	public function format($html) {
		$style = "";
		if ($this->opts['display'] != 'block')
			$style .= "display: {$this->opts['display']};";
		return <<< HTML
<div class="dfdiagram" style="$style">
$html
</div>
HTML;
	}


}

class DFDMWHooks {
	/**
	 * Hooks for integrating DFDiagram extension functionality with MediaWiki
	 */
	static public function init($parser) {
		// Register the <diagram> tag
		$parser->setHook('diagram', 'DFDMWHooks::create');
		return true;
	}
	static public function create($text, $args, $parser, $frame) {
		// HTML-style ignoring of whitespace
		if(preg_match('/\S/', $text) === 0){ // no match
			// Include the default diagram
			global $wgDFDDefaultDiagramPath;
			$text = file_get_contents($wgDFDDefaultDiagramPath);
		}
		// Remove leading newlines
		$text = preg_replace('/^\n+/', '', $text);
		// Create new DFDiagram
		$diagram = new DFDiagram($text, $args);
		return $diagram->render();
	}
	static public function includeModules($outPage, $skin) {
		/*
		 * Include the resources in $wgResourceModules
		 */
		$user = $skin->getContext()->getUser();

		$outPage->addModuleStyles(array('ext.DFDiagram'));
		$outPage->addModules(array('ext.DFDiagram'));
		if($user->getOption('dfdiagram-use-canvas')) {
			$outPage->addModules('ext.DFDiagram.canvas');
		}

		return true;
	}
	static public function getPreferences($user, &$preferences) {
		// Create preferences
		$preferences['dfdiagram-use-canvas'] = array(
			'type' => 'toggle',
			'label-message' => 'dfdiagram-use-canvas',
			'section' => 'dfdiagram/dfdiagram-canvas'
		);
		return true;
	}
}

#$DFDFile = new DFDBlockFile($wgDFDConfigFile);
