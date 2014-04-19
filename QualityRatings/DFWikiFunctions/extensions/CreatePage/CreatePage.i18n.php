<?php
/**
 * Internationalisation for CreatePage
 */
$messages = array();
 
/** English
 * @author Lethosor
 */
$messages[ 'en' ] = array(
    'createpage' => "Create page",
    'createpage-desc' => "Gives unprivileged users the ability to create pages",
    'createpage-form-text' => 'Enter the name of the page you want to create below.',
    'createpage-confirm' => 'You are creating page [[$1]]. Press "Submit" to confirm or "Cancel" to go back.',
    'createpage-exists' => '<p class="error">The page [[$1]] already exists!</p>',
    'createpage-invalid' => '<p class="error">"$1" is not a valid page name!</p>',
    'createpage-summary' => 'Creating page - requested by [[User:$1|$1]] ([[User_talk:$1|talk]] | [[Special:Contributions/$1|contribs]])',
    'createpage-success' => 'Created page [[$1]].',
    'createpage-unneeded' => 'You already have permission to create [[$1]].',
    'createpage-newtext' => '<!-- created page - requested by $1 -->',
    'createpage-user' => 'Page creator',
);
 
/** Message documentation
 * @author Lethosor
 */
$messages[ 'qqq' ] = array(
    'createpage' => "CreatePage title",
    'createpage-desc' => "CreatePage description",
    'createpage-form-text' => 'Text to display on page creation form',
    'createpage-confirm' => 'Confirmation shown before creating a page',
    'createpage-exists' => 'Error shown when a page attempting to be created already exists',
    'createpage-invalid' => 'Error shown when the requested page title is invalid',
    'createpage-summary' => 'Edit summary for new pages',
    'createpage-success' => 'Message shown after creating a page',
    'createpage-unneeded' => 'Message shown when user already has the ability to create pages',
    'createpage-newtext' => 'Text to place on newly-created pages',
    'createpage-user' => 'User to credit for new pages',
);
