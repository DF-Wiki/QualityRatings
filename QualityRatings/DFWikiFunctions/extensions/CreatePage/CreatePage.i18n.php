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
    'createpage-summary' => 'Creating page - requested by [[User:$1|$1]] ([[User_talk:$1|talk]] | [[Special:Contributions/$1|contribs]])',
    'createpage-success' => 'Created page [[$1]].',
    'createpage-newtext' => '<!-- created page - requested by $1 -->',
    'createpage-user' => 'Page creator',

    'createpage-error-blocked' => '<p class="error">You can\'t create this page because you are blocked.</p>',
    'createpage-error-exists' => '<p class="error">The page [[$1]] already exists!</p>',
    'createpage-error-invalid' => '<p class="error">"$1" is not a valid page name!</p>',
);
 
/** Message documentation
 * @author Lethosor
 */
$messages[ 'qqq' ] = array(
    'createpage' => "CreatePage title",
    'createpage-desc' => "CreatePage description",
    'createpage-form-text' => 'Text to display on page creation form',
    'createpage-confirm' => 'Confirmation shown before creating a page',
    'createpage-summary' => 'Edit summary for new pages',
    'createpage-success' => 'Message shown after creating a page',
    'createpage-newtext' => 'Text to place on newly-created pages',
    'createpage-user' => 'User to credit for new pages',

    'createpage-error-blocked' => 'Error shown when a user attempting to create a page is blocked',
    'createpage-error-exists' => 'Error shown when a page attempting to be created already exists',
    'createpage-error-invalid' => 'Error shown when the requested page title is invalid',
);
