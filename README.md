dfwiki-rater
============

A rating script for the Dwarf Fortress wiki

Installation
------------

### Using git (recommended)
On Linux/OS X:
```sh
cd {mediawiki}/extensions    # where {mediawiki} is the root of your MediaWiki installation
git clone git://github.com/lethosor/dfwiki-rater    # https:// works as well
```
(Windows users can use their git client to clone this repo into the MediaWiki extensions folder)

Add this line to `LocalSettings.php`:
```php
require_once("$IP/extensions/dfwiki-rater/QualityRatings/QualityRatings.php");
```

### Manually
Download the [latest version](https://github.com/lethosor/dfwiki-rater/releases) and copy the
dfwiki-rater folder into your extensions folder. Add the same line to `LocalSettings.php`:
```php
require_once("$IP/extensions/dfwiki-rater/QualityRatings/QualityRatings.php");
```

