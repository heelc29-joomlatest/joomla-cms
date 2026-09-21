/**
 * Enable the WebAuthn domain in the browser's DevTools protocol.
 */
Cypress.Commands.add('webauthn_enable', () =>
  Cypress.automation('remote:debugger:protocol', { command: 'WebAuthn.enable', params: {} }),
);

/**
 * Disable the WebAuthn domain in the browser's DevTools protocol.
 */
Cypress.Commands.add('webauthn_disable', () =>
  Cypress.automation('remote:debugger:protocol', { command: 'WebAuthn.disable', params: {} }),
);

/**
 * Add a virtual WebAuthn authenticator and yield the authenticatorId.
 *
 * Default options: { protocol: 'ctap2', transport: 'internal', hasResidentKey: true, hasUserVerification: true, isUserVerified: true }
 *
 * @param {object} [options={}] - Partial overrides for the defaults.
 * @returns {Promise<string>} resolves with the created authenticatorId
 */
Cypress.Commands.add('webauthn_addAuthenticator', (options = {}) => {
  const opts = {
    protocol: 'ctap2',
    transport: 'internal',
    hasResidentKey: true,
    hasUserVerification: true,
    isUserVerified: true,
    ...options,
  };

  return Cypress.automation('remote:debugger:protocol', {
    command: 'WebAuthn.addVirtualAuthenticator',
    params: { options: opts },
  }).then((res) => res.authenticatorId);
});

/**
 * Remove a previously created virtual authenticator.
 *
 * @param {string} id - The authenticatorId returned by webauthn_addAuthenticator.
 */
Cypress.Commands.add('webauthn_removeAuthenticator', (id) =>
  Cypress.automation('remote:debugger:protocol', {
    command: 'WebAuthn.removeVirtualAuthenticator',
    params: { authenticatorId: id },
  }),
);

/**
 * Get credentials from a virtual WebAuthn authenticator.
 *
 * @param {string} id - authenticatorId returned by webauthn_addAuthenticator
 * @returns {Promise<Array>} resolves with the credentials array
 */
Cypress.Commands.add('webauthn_getCredentials', (id) => {
  return Cypress.automation('remote:debugger:protocol', {
    command: 'WebAuthn.getCredentials',
    params: { authenticatorId: id },
  }).then((res) => res.credentials);
});
