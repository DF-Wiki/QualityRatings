DFDiagram
=========
A MediaWiki extension implementing Dwarf Fortress-style diagrams.

This extension has only been tested on MediaWiki 1.20/1.21, but should work on most recent versions.
Post any issues you find [in the issue tracker](https://github.com/lethosor/DFDiagram/issues) (you can also use the issue tracker to make suggestions).

Installation
------------
Source code can be downloaded from [GitHub](https://github.com/lethosor/DFDiagram) ([direct link](https://github.com/lethosor/DFDiagram/archive/master.zip)), or cloned using git with `git clone git://github.com/lethosor/DFDiagram.git`.

Make sure the DFDiagram folder is located in your (MediaWiki)/extensions folder and add the following line to `LocalSettings.php`:
```php
require_once( "$IP/extensions/DFDiagram/DFDiagram.php" );
```
Navigate to `Special:Version` on your wiki to verify that the extension has been installed.

Usage
-----
See the [wiki](https://github.com/lethosor/DFDiagram/wiki) for more information.
