<?php
class SpecialCreatePage extends SpecialPage {
    public static $createForm = <<<HTML
<form method="post">
    <label for="createpage-title">Page title:</label>
    <input type="text" name="page" id="createpage-title">
    <input type="submit" value="Create">
</form>
HTML;
    public static $confirmForm = <<<HTML
<form method="post">
    <input type="hidden" name="confirm" value="%TOKEN%">
    <input type="hidden" name="page" value="%PAGE%">
    <input type="submit" name="cancel" value="Cancel">
    <input type="submit" name="submit" value="Submit">
</form>
HTML;
    public static function getConfirmToken($request) {
        return md5($request->getAllHeaders()['USER-AGENT']);
    }
    public function __construct() {
        parent::__construct('CreatePage');
    }
    public function execute($par) {
        $request = $this->getRequest();
        $output = $this->getOutput();
        $page = $par ? $par : $request->getText('page');
        $this->confirmToken = self::getConfirmToken($request);
        self::$confirmForm = preg_replace('/%TOKEN%/', $this->confirmToken, self::$confirmForm);
        self::$confirmForm = preg_replace('/%PAGE%/', $page, self::$confirmForm);
        $opts = array(
            'page' => $page,
            'confirm' => $request->getBool('confirm'),
            'submit' => $request->getText('submit'),
        );
        if ($opts['confirm']) {
            $this->create($output, $opts);
        }
        elseif ($opts['page']) {
            $this->confirm($output, $opts['page']);
        }
        else {
            $this->displayForm($output);
        }
    }
    public function displayForm($output) {
        $output->setPageTitle('Create page');
        $output->addHTML($this->msg('createpage-form-text')->parse());
        $output->addHTML(self::$createForm);
    }
    public function confirm($output, $page) {
        $title = Title::newFromText($page);
        $output->setPageTitle("Creating page \"$page\"");
        if ($title->isKnown()) {
            $output->addHTML($this->msg('createpage-exists')->params($page)->parse());
            $this->displayForm($output);
            return false;
        }
        $output->addHTML($this->msg('createpage-confirm')->params($page)->parse());
        $output->addHTML(self::$confirmForm);
    }
    public function create($output, $opts) {
        $page = $opts['page'];
        if (!$opts['submit']) {
            // Cancel was pressed
            $this->displayForm($output);
            return;
        }
        if ($opts['confirm'] != $this->confirmToken) {
            // Invalid confirmation token
            $this->confirm($output, $opts['page']);
            return false;
        }
        $this->doCreate($page);
        $output->setPageTitle('Created page');
        $output->addHTML($this->msg('createpage-success')->params($page)->parse());
    }
    public function doCreate($pageTitle) {
        $title = Title::newFromText($pageTitle);
        $page = WikiPage::factory($title);
        $user = User::newFromName($this->msg('createpage-user')->plain());
        $page->doEdit(
            $this->msg('createpage-newtext')->plain(),
            'Creating page',
            0, false,  // flags, baseRevId
            $user
        );
        return true;
    }
}
