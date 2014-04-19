<?php
$wgNamespaceAliases['MDF'] = 1000;
$wgNamespaceAliases['MDF_TALK'] = 1001;

$wgNamespaceAliases['U'] = 2;
$wgNamespaceAliases['F'] = 6;
$wgNamespaceAliases['T'] = 10;
$wgNamespaceAliases['H'] = 12;
$wgNamespaceAliases['C'] = $wgNamespaceAliases['CAT'] = 14;

$DFReleases = array(
    1 => 110,
    2 => 106,
    3 => 112,
    4 => 114,
);

foreach ($DFReleases as $id => $ns) {
    $wgNamespaceAliases['Rel' . $id] = $wgNamespaceAliases['V' . $id] = $ns;
    $wgNamespaceAliases['Rel' . $id . '_talk'] = $wgNamespaceAliases['V' . $id . '_talk'] = $ns;
}
