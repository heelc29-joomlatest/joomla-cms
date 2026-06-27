<?php

/**
 * Joomla! Content Management System
 *
 * @copyright  (C) 2026 Open Source Matters, Inc. <https://www.joomla.org>
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\CMS\WebAuthn\Repository;

use Webauthn\PublicKeyCredentialSource;
use Webauthn\PublicKeyCredentialUserEntity;

// phpcs:disable PSR1.Files.SideEffects
\defined('_JEXEC') or die;
// phpcs:enable PSR1.Files.SideEffects

/**
 * Repository interface for storing and retrieving credential records.
 *
 * @see https://www.w3.org/TR/webauthn-3/#credential-record
 */
interface CredentialRecordRepositoryInterface
{
    /**
     * @param   PublicKeyCredentialUserEntity  $publicKeyCredentialUserEntity
     *
     * @return  PublicKeyCredentialSource[]
     *
     * @since   __DEPLOY_VERSION__
     *
     * @todo    The return type will change to \Webauthn\CredentialRecord[] when we upgrade to WebAuthn library 5.3 or later
     */
    public function findAllForUserEntity(PublicKeyCredentialUserEntity $publicKeyCredentialUserEntity): array;

    /**
     * @param   string  $publicKeyCredentialId
     *
     * @return  ?PublicKeyCredentialSource
     *
     * @since   __DEPLOY_VERSION__
     *
     * @todo    The return type will change to ?\Webauthn\CredentialRecord when we upgrade to WebAuthn library 5.3 or later
     */
    public function findOneByCredentialId(string $publicKeyCredentialId): ?PublicKeyCredentialSource;
}
